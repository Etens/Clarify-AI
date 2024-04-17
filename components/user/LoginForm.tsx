import { Profil } from "../user/Profil";
import { formSchema, FormValues } from "../../schemas/formSchema";
import { Form, FormField, FormItem, FormControl, FormLabel, FormDescription, FormMessage } from "../user/Form";
import { Input } from "../input/SearchBar";
import { Button } from "../button/Button";

export function LoginForm() {
  const form = Profil();

  const onSubmit = (values: FormValues) => {
    // Ici, on utilise FormValues pour typer les valeurs du formulaire
    console.log(values);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input placeholder="login" {...field} />
              </FormControl>
              <FormDescription>This is your public display name.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  );
}
