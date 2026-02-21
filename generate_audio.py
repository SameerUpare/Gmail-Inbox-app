from gtts import gTTS
import os

text = "Welcome to the Antigravity Gmail Inbox Intelligence system. This platform is built with a safety-first architecture, ensuring read-only access to your Gmail. On the dashboard, you can view your scan summary, total unread emails, and see top senders. In the Sender Explorer, you can dive deep into individual engagement metrics. On the Plans page, you can generate deterministic cleanup rules and simulate their impact with zero real-world mutations. When you're ready, the system supports controlled execution with a full undo capability. All system actions are transparently recorded in the Audit logs."

tts = gTTS(text=text, lang='en')

out_path = "d:/GmailInbox/Gmail-Inbox-app/ui/public/demo_audio.mp3"
os.makedirs(os.path.dirname(out_path), exist_ok=True)
tts.save(out_path)
print("Audio saved successfully to", out_path)
