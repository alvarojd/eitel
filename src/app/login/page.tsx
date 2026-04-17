import { LoginComponent } from "@/presentation/components/auth/Login";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Iniciar Sesión | Hexasense',
  description: 'Accede al panel de control de Hexasense IoT',
};

export default function LoginPage() {
  return <LoginComponent />;
}
