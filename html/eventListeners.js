document.addEventListener('DOMContentLoaded', function() {
  document.getElementById('connect_button').addEventListener('click', connectAs)
  document.getElementById('send_button').addEventListener('click', handleSend)
  document.getElementById('messageField').addEventListener('keydown', handleKeyDown)
})
