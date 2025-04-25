import { useEffect } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2 } from "lucide-react";

const loginSchema = z.object({
  username: z.string().min(1, { message: "El nombre de usuario es obligatorio" }),
  password: z.string().min(1, { message: "La contraseña es obligatoria" }),
});

const registerSchema = z.object({
  username: z.string().min(3, { message: "El nombre de usuario debe tener al menos 3 caracteres" }),
  password: z.string().min(6, { message: "La contraseña debe tener al menos 6 caracteres" }),
  fullName: z.string().min(1, { message: "El nombre completo es obligatorio" }),
  isAdmin: z.boolean().default(false),
});

type LoginValues = z.infer<typeof loginSchema>;
type RegisterValues = z.infer<typeof registerSchema>;

export default function AuthPage() {
  const [location, navigate] = useLocation();
  const { user, loginMutation, registerMutation } = useAuth();

  const loginForm = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const registerForm = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      password: "",
      fullName: "",
      isAdmin: false,
    },
  });

  function onLoginSubmit(data: LoginValues) {
    loginMutation.mutate(data);
  }

  function onRegisterSubmit(data: RegisterValues) {
    registerMutation.mutate({
      ...data,
      kpiConfig: {},
    });
  }

  // Redirect to home if already authenticated
  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  return (
    <div className="flex min-h-screen">
      {/* Login Form Section */}
      <div className="w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <div className="h-16 flex items-center justify-center mb-4">
              <svg className="w-16 h-16 text-primary" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                <path fill="currentColor" d="M16 2C8.268 2 2 8.268 2 16s6.268 14 14 14 14-6.268 14-14S23.732 2 16 2zm-4.95 19.535H8.466v-7.07H11.05v7.07zm6.583 0h-2.583v-7.07h2.583v7.07zm6.583 0h-2.583v-7.07h2.583v7.07z"/>
              </svg>
            </div>
            <h1 className="text-3xl font-montserrat font-bold text-primary">Sistema de Gestión Documental</h1>
          </div>

          <Tabs defaultValue="login" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Iniciar Sesión</TabsTrigger>
              <TabsTrigger value="register">Registrarse</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <Form {...loginForm}>
                <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                  <FormField
                    control={loginForm.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nombre de Usuario</FormLabel>
                        <FormControl>
                          <Input placeholder="andrevin" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={loginForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contraseña</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="••••••••" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={loginMutation.isPending}
                  >
                    {loginMutation.isPending ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : null}
                    Iniciar Sesión
                  </Button>
                </form>
              </Form>
            </TabsContent>

            <TabsContent value="register">
              <Form {...registerForm}>
                <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                  <FormField
                    control={registerForm.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nombre de Usuario</FormLabel>
                        <FormControl>
                          <Input placeholder="usuario1" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={registerForm.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nombre Completo</FormLabel>
                        <FormControl>
                          <Input placeholder="Juan Pérez" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={registerForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contraseña</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="••••••••" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={registerForm.control}
                    name="isAdmin"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>
                            Usuario Administrador
                          </FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={registerMutation.isPending}
                  >
                    {registerMutation.isPending ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : null}
                    Registrarse
                  </Button>
                </form>
              </Form>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Hero Image Section */}
      <div 
        className="w-1/2 bg-cover bg-center"
        style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80)' }}
      >
        <div className="h-full w-full bg-secondary/50 backdrop-blur-sm p-12 flex flex-col justify-center">
          <div className="bg-white/90 p-8 rounded-lg shadow-lg max-w-lg">
            <h2 className="text-2xl font-semibold text-primary mb-4">
              Bienvenido al Sistema de Gestión Documental
            </h2>
            <p className="text-secondary mb-4">
              Acceda a toda la documentación de la organización de forma centralizada. 
              Navegue a través de los procesos, subprocesos y consulte manuales, procedimientos y plantillas.
            </p>
            <p className="text-secondary mb-4">
              Visualice indicadores de rendimiento y mantenga el control sobre sus procesos de negocio.
            </p>
            <p className="text-xs text-gray-500">
              Para asistencia técnica, contacte al administrador del sistema.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
