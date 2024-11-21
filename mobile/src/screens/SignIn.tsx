import {
  VStack,
  Image,
  Center,
  Text,
  Heading,
  ScrollView,
  Toast,
  ToastTitle,
} from '@gluestack-ui/themed';
import BackgroungImg from '@assets/background.png';
import Logo from '@assets/logo.svg';
import { Input } from '@components/Input';
import { Button } from '@components/Button';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

import { AuthNavigatorRoutesProps } from '@routes/auth.routes';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '@hooks/useAuth';
import { AppError } from '@utils/AppError';
import { useToast } from '@gluestack-ui/themed';

type FormDataProps = {
  email: string;
  password: string;
};

const signInSchema = yup.object({
  email: yup.string().required('Informe o email.').email('E-mail inválido.'),
  password: yup
    .string()
    .required('Informe a senha.')
    .min(6, 'A senha deve conter pelo menos 6 dígitos.'),
});

export function SignIn() {
  const toast = useToast();
  const { signIn } = useAuth();
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormDataProps>({
    resolver: yupResolver(signInSchema),
  });

  const natigation = useNavigation<AuthNavigatorRoutesProps>();

  function handleNewAccount() {
    natigation.navigate('signUp');
  }

  async function handleSignIn({ email, password }: FormDataProps) {
    try {
      await signIn(email, password);
    } catch (error) {
      const isAppError = error instanceof AppError;
      const title = isAppError
        ? error.message
        : 'Não foi possivel entrar. Tente mais tarde.';

      toast.show({
        placement: 'top',
        render: () => (
          <Toast
            backgroundColor='$red500'
            action='error'
            variant='outline'
            mt='$14'
          >
            <ToastTitle color='$white'>{title}</ToastTitle>
          </Toast>
        ),
      });
    }
  }

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ flexGrow: 1 }}
    >
      <VStack flex={1}>
        <Image
          w='$full'
          h={624}
          source={BackgroungImg}
          defaultSource={BackgroungImg}
          alt='Pessoas treinando'
          position='absolute'
        />
        <VStack flex={1} px='$10' pb='$16'>
          <Center my='$16'>
            <Logo />

            <Text color='$gray100' fontSize='$sm'>
              Treine sua mente e seu corpo.
            </Text>
          </Center>

          <Center gap='$3'>
            <Heading color='$gray100'>Acesse a conta</Heading>

            <Controller
              control={control}
              name='email'
              render={({ field: { onChange, value } }) => (
                <Input
                  placeholder='E-mail'
                  keyboardType='email-address'
                  autoCapitalize='none'
                  onChangeText={onChange}
                  value={value}
                  errorMessage={errors.email?.message}
                />
              )}
            />

            <Controller
              control={control}
              name='password'
              render={({ field: { onChange, value } }) => (
                <Input
                  placeholder='Senha'
                  secureTextEntry
                  onChangeText={onChange}
                  value={value}
                  errorMessage={errors.password?.message}
                  onSubmitEditing={handleSubmit(handleSignIn)}
                  returnKeyType='send'
                />
              )}
            />

            <Button title='Acessar' onPress={handleSubmit(handleSignIn)} />
          </Center>
          <Center flex={1} justifyContent='flex-end' mt='$4'>
            <Text color='$gray100' fontSize='$sm' mb='$2' fontFamily='$body'>
              Ainda não tem acesso?
            </Text>
            <Button
              title='Criar Conta'
              variant='outline'
              onPress={handleNewAccount}
            />
          </Center>
        </VStack>
      </VStack>
    </ScrollView>
  );
}
