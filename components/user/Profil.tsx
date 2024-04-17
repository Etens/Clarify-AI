import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { formSchema } from '../../schemas//formSchema';

export const Profil = () => {
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: '',
    },
  });

  return form;
};
