import os

filepath = "src/pages/admin/AdminMore.tsx"
if os.path.exists(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    replacement = """      setTeacherForm({ fullName: '', username: '', password: '', phone: '', subject: '', certificates: '' });
    } catch (err: any) {
      console.error('Kontekst:', err);
      if (err.code === 'auth/email-already-in-use') {
        toast.error("Bu login (username) band, boshqasini tanlang!");
      } else {
        const msg = err instanceof Error ? err.message : "Noma'lum xatolik";
        toast.error(msg);
      }
    }"""
    
    content = content.replace("""      setTeacherForm({ fullName: '', username: '', password: '', phone: '', subject: '', certificates: '' });
    } catch (err) {
      console.error('Kontekst:', err);
      const msg = err instanceof Error ? err.message : "Noma'lum xatolik";
      toast.error(msg);
    }""", replacement)

    with open(filepath, 'w') as f:
        f.write(content)
