"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Loader2, Camera, Mail, Phone, Briefcase, MapPin } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function ProfileContent({ user }: { user: any }) {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user.professional?.name ?? user.name ?? "");
  const [phone, setPhone] = useState(user.professional?.phone ?? "");
  const [profession, setProfession] = useState(user.professional?.profession ?? "");
  const [specialty, setSpecialty] = useState(user.professional?.specialty ?? "");
  const [isLoading, setIsLoading] = useState(false);

  const photo = user.professional?.photo ?? user.image;
  const displayName = user.professional?.name ?? user.name;

  async function handleSave() {
    setIsLoading(true);
    try {
      await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone, profession, specialty }),
      });
      toast.success("Perfil atualizado!");
      setIsEditing(false);
    } catch {
      toast.error("Erro ao atualizar perfil.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex flex-col">
      {/* Profile Header */}
      <div className="flex flex-col items-center gap-3 p-6 pb-4 border-b border-border">
        <div className="relative">
          <Avatar className="w-24 h-24">
            <AvatarImage src={photo ?? undefined} />
            <AvatarFallback className="text-2xl font-bold bg-primary/10 text-primary">
              {displayName?.slice(0, 2).toUpperCase() ?? "??"}
            </AvatarFallback>
          </Avatar>
          <button className="absolute bottom-0 right-0 flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground shadow-md">
            <Camera className="w-4 h-4" />
          </button>
        </div>
        <div className="text-center">
          <h2 className="text-lg font-bold text-foreground">{displayName}</h2>
          <p className="text-sm text-muted-foreground">{user.email}</p>
          <Badge variant="outline" className="mt-1 text-xs">
            {user.plan}
          </Badge>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="dados" className="flex-1">
        <div className="px-4 pt-4">
          <TabsList className="w-full h-10">
            <TabsTrigger value="dados" className="flex-1 text-xs">Dados Pessoais</TabsTrigger>
            <TabsTrigger value="endereco" className="flex-1 text-xs">Endereço</TabsTrigger>
            <TabsTrigger value="profissional" className="flex-1 text-xs">Profissional</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="dados" className="px-4 py-4 flex flex-col gap-4">
          <Card>
            <CardContent className="p-4 flex flex-col gap-4">
              {isEditing ? (
                <>
                  <div>
                    <Label>Nome completo</Label>
                    <Input className="h-12 mt-1.5" value={name} onChange={(e) => setName(e.target.value)} />
                  </div>
                  <div>
                    <Label>Telefone</Label>
                    <Input type="tel" className="h-12 mt-1.5" value={phone} onChange={(e) => setPhone(e.target.value)} />
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1 h-11" onClick={() => setIsEditing(false)}>
                      Cancelar
                    </Button>
                    <Button className="flex-1 h-11" onClick={handleSave} disabled={isLoading}>
                      {isLoading && <Loader2 className="w-4 h-4 mr-1 animate-spin" />}
                      Salvar
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-foreground">{user.email}</span>
                  </div>
                  {phone && (
                    <div className="flex items-center gap-3">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-foreground">{phone}</span>
                    </div>
                  )}
                  <Button variant="outline" className="h-11 w-full" onClick={() => setIsEditing(true)}>
                    Editar dados pessoais
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="endereco" className="px-4 py-4">
          <Card>
            <CardContent className="p-4 flex flex-col gap-4">
              {user.professional?.address ? (
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                  <span className="text-sm text-foreground">
                    {[user.professional.address.street, user.professional.address.city]
                      .filter(Boolean).join(", ")}
                  </span>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Nenhum endereço cadastrado.</p>
              )}
              <Button variant="outline" className="h-11 w-full">
                Editar endereço
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="profissional" className="px-4 py-4">
          <Card>
            <CardContent className="p-4 flex flex-col gap-4">
              {isEditing ? (
                <>
                  <div>
                    <Label>Profissão</Label>
                    <Input className="h-12 mt-1.5" value={profession} onChange={(e) => setProfession(e.target.value)} />
                  </div>
                  <div>
                    <Label>Especialidade</Label>
                    <Input className="h-12 mt-1.5" value={specialty} onChange={(e) => setSpecialty(e.target.value)} />
                  </div>
                </>
              ) : (
                <>
                  {profession && (
                    <div className="flex items-center gap-3">
                      <Briefcase className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-foreground">{profession}</span>
                    </div>
                  )}
                  {!profession && (
                    <p className="text-sm text-muted-foreground">Dados profissionais não cadastrados.</p>
                  )}
                  <Button variant="outline" className="h-11 w-full" onClick={() => setIsEditing(true)}>
                    Editar dados profissionais
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
