import os
import sublime
import sublime_plugin
import subprocess
import threading
import functools

######################################################################
# Calling to command line with setting the current working directory,
# passing aurguments, etc.. 
######################################################################


class CompilerjsCommand(sublime_plugin.TextCommand):

  def __init__(self,*args, **kwargs):
    
    super(CompilerjsCommand, self ).__init__(*args, **kwargs)
    
    self.settings = "Compiler-JS.sublime-settings"
    self.window = self.view.window() or sublime.active_window()

    self.mainFile = sublime.load_settings(self.settings).get("main")
    if(not self.mainFile):
      self.mainFile = os.path.basename(self.view.file_name())

    if(len(self.window.folders())>0):
      self.working_dir = self.window.folders()[0]
    else:
      self.working_dir = os.path.dirname(self.view.file_name())

  def run_command(self, command, callback=None, show_status=True, filter_empty_args=True, **kwargs):
    if filter_empty_args:
      command = [arg for arg in command if arg]
    if 'working_dir' not in kwargs:
      kwargs['working_dir'] = self.working_dir
    s = sublime.load_settings(self.settings)
    if s.get('save_first') and self.view and self.view.is_dirty():
      self.view.run_command('save')
    if command[0] == 'compiler-js' and s.get('command'):
       command[0] = s.get('command')
    if not callback:
      callback = self.generic_done

    thread = Threading(command, callback, **kwargs)
    thread.start()

    if show_status:
      message = kwargs.get('status_message', False) or ' '.join(command)
      sublime.status_message(message)

  def generic_done(self, result):
    if not result.strip():
      return
    self.panel(result)

  def _output_to_view(self, output_file, output, clear=False, syntax="Packages/JavaScript/JavaScript.tmLanguage"):
    output_file.set_syntax_file(syntax)
    edit = output_file.begin_edit()
    if clear:
      region = sublime.Region(0, self.output_view.size())
      output_file.erase(edit, region)
    output_file.insert(edit, 0, output)
    output_file.end_edit(edit)

  def scratch(self, output, title=False, **kwargs):
    scratch_file = self.window.new_file()
    if title:
      scratch_file.set_name(title)
    scratch_file.set_scratch(True)
    self._output_to_view(scratch_file, output, **kwargs)
    scratch_file.set_read_only(True)
    return scratch_file

  def panel(self, output, **kwargs):
    if not hasattr(self, 'output_view'):
      self.output_view = self.window.get_output_panel("git")
    self.output_view.set_read_only(False)
    self._output_to_view(self.output_view, output, clear=True, **kwargs)
    self.output_view.set_read_only(True)
    self.window.run_command("show_panel", {"panel": "output.git"})

  def quick_panel(self, *args, **kwargs):
    self.window.show_quick_panel(*args, **kwargs)


######################################################################
# Commands
######################################################################

class CompilerjsRunCommand(CompilerjsCommand):
  def run(self, edit):
    
    command = ['compiler-js',self.mainFile]
    self.run_command(command, self.command_done)

  def command_done(self, result):
    self.panel(result)

class CompilerjsDebugCommand(CompilerjsCommand):
  def run(self, edit):
    command = ['compiler-js',self.mainFile,"debug"]
    self.run_command(command, self.command_done)

  def command_done(self, result):
    self.panel(result)

######################################################################
# Threading
######################################################################

def main_thread(callback, *args, **kwargs):
  # sublime.set_timeout gets used to send things onto the main thread
  # most sublime.[something] calls need to be on the main thread
  sublime.set_timeout(functools.partial(callback, *args, **kwargs), 0)

def _make_text_safeish(text, fallback_encoding):
  # The unicode decode here is because sublime converts to unicode inside
  # insert in such a way that unknown characters will cause errors, which is
  # distinctly non-ideal... and there's no way to tell what's coming out of
  # git in output. So...
  try:
    unitext = text.decode('utf-8')
  except UnicodeDecodeError:
    unitext = text.decode(fallback_encoding)
  return unitext

class Threading(threading.Thread):
  def __init__(self, command, on_done, working_dir="", fallback_encoding=""):
    threading.Thread.__init__(self)
    self.command = command
    self.on_done = on_done
    self.working_dir = working_dir
    self.fallback_encoding = fallback_encoding

  def run(self):
    try:


      # Per http://bugs.python.org/issue8557 shell=True is required to
      # get $PATH on Windows. Yay portable code.
      shell = os.name == 'nt'
      if self.working_dir != "":
        os.chdir(self.working_dir)
      proc = subprocess.Popen(self.command,
        stdout=subprocess.PIPE, stderr=subprocess.STDOUT,
        shell=shell, universal_newlines=True)

      output = proc.communicate()[0]
      # if sublime's python gets bumped to 2.7 we can just do:
      # output = subprocess.check_output(self.command)
      
      main_thread(self.on_done, _make_text_safeish(output, self.fallback_encoding))
       
    except subprocess.CalledProcessError, e:
      main_thread(self.on_done, e.returncode)
    except OSError, e:
      if e.errno == 2:
        main_thread(self.on_done, "Command: \""+self.command[0]+"\" could not be found.\n\nConsider using the command setting for the plugin")
      else:
        raise e
