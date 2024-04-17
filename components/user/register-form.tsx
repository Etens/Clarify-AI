import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { formSchema, FormValues } from "../../schemas/formSchema";
import { Input } from "../common/searchbar";
import { Button } from "../button/button";
import { Form, FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "./form";

export function RegisterForm() {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      // Définissez les valeurs par défaut pour les autres champs ici
    },
  });

  const onSubmit = (values: FormValues) => {
    console.log(values);
  };

  return (
    <FormField
      control={form.control}
      name="username"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Username</FormLabel>
          <FormControl>
            <Input placeholder="shadcn" {...field} />
          </FormControl>
          <FormDescription>This is your public display name.</FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
