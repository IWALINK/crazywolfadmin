"use client";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { login } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const dispatch = useDispatch();
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === "admin" && password === "admin") {
      dispatch(login());
      router.push("/");
    } else {
      setError("Nom d'utilisateur ou mot de passe invalide");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100">
      <Card className="w-full max-w-md shadow-xl border-0">
        <CardHeader className="flex flex-col items-center">
          <img src="/placeholder-logo.png" alt="Logo" className="w-16 h-16 mb-2 rounded-full shadow" />
          <CardTitle className="text-3xl font-bold mb-1">Bienvenue</CardTitle>
          <CardDescription className="text-center">Connectez-vous à votre compte administrateur</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit} autoComplete="off">
          <CardContent className="space-y-4">
            <div>
              <Input
                type="text"
                placeholder="Nom d'utilisateur"
                value={username}
                onChange={e => setUsername(e.target.value)}
                autoFocus
                className="mb-2"
              />
            </div>
            <div>
              <Input
                type="password"
                placeholder="Mot de passe"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="mb-2"
              />
            </div>
            {error && <div className="text-red-500 text-sm text-center">{error}</div>}
          </CardContent>
          <CardFooter className="flex flex-col gap-2">
            <Button type="submit" className="w-full h-11 text-base font-semibold">Se connecter</Button>
            {/* <div className="text-xs text-muted-foreground text-center w-full mt-2">Nom d'utilisateur et mot de passe : <span className="font-medium">admin</span></div> */}
          </CardFooter>
        </form>
      </Card>
    </div>
  );
} 