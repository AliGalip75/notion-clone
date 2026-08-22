import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router";
import { authApi } from "@/api/auth";
import { useAuthStore } from "@/stores/authStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

export default function RegisterPage() {
  const navigate = useNavigate();
  const setUser = useAuthStore((s) => s.setUser);

  const [form, setForm] = useState({
    email: "",
    first_name: "",
    last_name: "",
    password: "",
    password_confirm: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const update = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (form.password !== form.password_confirm) {
      setError("Şifreler eşleşmiyor.");
      return;
    }

    setLoading(true);
    try {
      const { data } = await authApi.register(form);
      setUser(data);
      navigate("/");
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: Record<string, string[]> } };
      const messages = axiosErr.response?.data;
      if (messages) {
        const firstKey = Object.keys(messages)[0];
        const firstMsg = messages[firstKey];
        setError(Array.isArray(firstMsg) ? firstMsg[0] : String(firstMsg));
      } else {
        setError("Kayıt başarısız.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-zinc-50 dark:bg-zinc-950">
      <Card className="w-full max-w-sm animate-fade-in shadow-xl">
        <CardHeader className="text-center pb-6">
          <CardTitle className="text-2xl font-bold">Kayıt Ol</CardTitle>
          <CardDescription>Yeni hesap oluşturun</CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive" className="py-2.5">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-xs">{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="register-email">Email</Label>
              <Input
                id="register-email"
                type="email"
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
                required
                placeholder="email@example.com"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="register-first-name">Ad</Label>
                <Input
                  id="register-first-name"
                  type="text"
                  value={form.first_name}
                  onChange={(e) => update("first_name", e.target.value)}
                  required
                  placeholder="Ali"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="register-last-name">Soyad</Label>
                <Input
                  id="register-last-name"
                  type="text"
                  value={form.last_name}
                  onChange={(e) => update("last_name", e.target.value)}
                  required
                  placeholder="Yetiş"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="register-password">Şifre</Label>
              <Input
                id="register-password"
                type="password"
                value={form.password}
                onChange={(e) => update("password", e.target.value)}
                required
                placeholder="••••••••"
              />
            </div>

            <div className="space-y-2 mb-5">
              <Label htmlFor="register-password-confirm">Şifre Tekrar</Label>
              <Input
                id="register-password-confirm"
                type="password"
                value={form.password_confirm}
                onChange={(e) => update("password_confirm", e.target.value)}
                required
                placeholder="••••••••"
              />
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Kayıt yapılıyor..." : "Kayıt Ol"}
            </Button>

            <div className="text-center text-sm text-muted-foreground w-full">
              Zaten hesabınız var mı?{" "}
              <Link to="/login" className="font-medium text-primary hover:underline">
                Giriş yap
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
