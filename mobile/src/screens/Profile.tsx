import { useState } from 'react';
import { ScrollView, TouchableOpacity } from 'react-native';
import { Center, Heading, useToast, Text, VStack, Toast, ToastTitle } from '@gluestack-ui/themed';
import { ScreenHeader } from '@components/ScreenHeader';
import { UserPhoto } from '@components/UserPhoto';
import { Input } from '@components/Input';
import { Button } from '@components/Button';
import * as mime from 'mime';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { ObjectSchema } from 'yup'; 
import { useAuth } from '@hooks/useAuth';
import { api } from '@services/api';
import { AppError } from '@utils/AppError';
import defaultUserPhotoImg from "@assets/userPhotoDefault.png";

type FormDataProps = {
  name: string;
  email: string;
  password?: string;
  old_password?: string | null;
  confirm_password?: string | null;
};

const profileSchema = yup.object().shape({
  name: yup.string().required("Informe o nome"),
  password: yup
    .string()
    .min(6, "A senha deve ter pelo menos 6 dígitos.")
    .nullable()
    .transform((value) => (!!value ? value : null)),
  confirm_password: yup
    .string()
    .nullable()
    .transform((value) => (!!value ? value : null))
    .oneOf([yup.ref("password"), null], "A confirmação de senha não confere.")
    .when("password", {
      is: (Field: any) => Field,
      then: (schema) =>
        schema.nullable().required("Informe a confirmação da senha.")
      .transform((value) => (!!value ? value : null)),
    }),
  }) as ObjectSchema<FormDataProps>



export function Profile() {
const [isUpdating, setIsUpdating] = useState(false);
const [userPhoto, setUserPhoto] = useState(require('../../src/assets/AnselmoIGniteGym.png'));

 const toast = useToast();
 const { user, updateUserProfile } = useAuth();
 const { control, handleSubmit, formState: { errors } } = useForm({
  defaultValues: {
    name: user.name,
    email: user.email,
  },
   resolver: yupResolver(profileSchema)
 });

 async function handleUserPhotoSelect() {
     try {
      setIsUpdating(true);
      const photoSelected = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 1,
        aspect: [4, 4],
        allowsEditing: true,
      });

    if (photoSelected.canceled) {
      return;
   }

   const photoURI = photoSelected.assets[0].uri;
     if (photoURI) {
      const photoInfo = (await FileSystem.getInfoAsync(photoURI)) as {
        size: number 
      }
       
      if (photoInfo.size && (photoInfo.size / 1024 / 1024) > 5) {
         const title = 'Imagem tem o tamanho maior que 5MB!'
         return toast.show({
          placement: 'top',
          render: ({ id }) => {
            const toastId = `toast-${id}`
            return (
              <Toast
                nativeID={toastId}
                backgroundColor='$red500'
                action='error'
                variant='outline'
                mt='$14'
              >
                <ToastTitle color='$white'>{title}</ToastTitle>
              </Toast>
            )
          }
        })
      }
      
      const fileExtension = photoURI.split('.').pop() || 'jpg' || 'png'; 
      const mimeType = mime.getType(photoURI) || 'image/jpeg' || 'image/png';
     
      const photoFile = {
        name: `${user.name}.${fileExtension}`.replaceAll(' ', '').toLowerCase(), 
        uri: photoSelected.assets[0].uri,
        type: mimeType .replaceAll(' ', '').toLowerCase(),  
      } as any;
      
      const userPhotoUploadedForm = new FormData();
      userPhotoUploadedForm.append('avatar', photoFile);

    const avatarUpdatedResponse =  await api.patch('/users/avatar', userPhotoUploadedForm, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'multipart/form-data',
        },
         signal: new AbortController().signal,
      });

      const userUpdated = user;
      userUpdated.avatar = avatarUpdatedResponse.data.avatar;
      setUserPhoto(photoFile.uri);
      updateUserProfile(userUpdated);

      const title = 'Foto atualizada!'; 
      toast.show({
        placement: 'top',
        render: () => (
          <Toast
            backgroundColor='$green500'
            action='success'
            variant='outline'
            mt='$14'
          >
            <ToastTitle color='$white'>{title}</ToastTitle>
          </Toast>
        ),
      });

    } else {
      const title = 'Erro ao atualizar foto!'; 
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
      if (photoSelected.canceled) {
        return;
      }

    }
   } catch (error) {
     console.log(error);
   } finally {
     setIsUpdating(false);
   }
 }

 async function handleProfileUpdate(data: FormDataProps) {
    try {
      setIsUpdating(true);
      await api.put('/users', data);

      const title = 'Perfil atualizado com sucesso!'; 
      toast.show({
        placement: 'top',
        render: () => (
          <Toast
            backgroundColor='$green500'
            action='success'
            variant='outline'
            mt='$14'
          >
            <ToastTitle color='$white'>{title}</ToastTitle>
          </Toast>
        ),
      });

    } catch (error) {
      const isAppError = error instanceof AppError;
      const title = isAppError
        ? error.message
        : 'Não foi possivel atualizar o perfil. Tente mais tarde.';

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
    } finally {
      setIsUpdating(false);
    }
 }
 
  return (
   <VStack flex={1}>
    <ScreenHeader title="Perfil" />

    <ScrollView contentContainerStyle={{ paddingBottom: 36 }}>
      <Center mt="$6" px='$10'>
        <UserPhoto 
          source={ user.avatar ? 
            { uri: `${api.defaults.baseURL}/avatar/${user.avatar}` } : 
            defaultUserPhotoImg 
          } 
          alt='Foto do usuário'
          size='xl'
          w='$32'
          h='$32'
        />
        <TouchableOpacity onPress={handleUserPhotoSelect}>
          <Text 
            color='$green500'
            mt='$2'
            mb='$8' 
            fontFamily='$heading'
            fontSize='$md'
          >
            Alterar foto
          </Text>

        </TouchableOpacity>
        <Center 
          w='$full' 
          gap='$4'
        >
        <Controller
          control={control}
          name='name'
          render={({ field: { onChange, value } }) => (
              <Input 
                placeholder='Nome' 
                bg='$gray600' 
                onChangeText={onChange}
                value={value}
                errorMessage={errors.name?.message}
              />
            )}
          />

        <Controller
          control={control}
          name='email'
          render={({ field: { onChange, value } }) => (
              <Input 
                placeholder='E-mail' 
                bg='$gray600' 
                isReadOnly
                onChangeText={onChange}
                value='polcaronet@gmail.com' 
              />
            )}
          />
        
        </Center>

        <Heading 
          alignSelf='flex-start' 
          mt='$12' 
          mb='$2' 
          fontFamily='$heading' 
          fontSize='$md'
          color='$gray200'
        >
          Alterar senha
        </Heading>

        <Center 
          gap='$4' 
          w='$full'
        >
        <Controller
          control={control}
          name='old_password'
          render={({ field: { onChange } }) => (
              <Input 
                placeholder='Senha antiga' 
                bg='$gray600' 
                onChangeText={onChange}
                isPassword
                errorMessage={errors.old_password?.message}
                
              />
            )}
          />

        <Controller
          control={control}
          name='password'
          render={({ field: { onChange } }) => (
              <Input 
                placeholder='Nova senha'  
                bg='$gray600' 
                onChangeText={onChange}
                isPassword
                errorMessage={errors.password?.message}
              />
            )}
          />

        <Controller
          control={control}
          name='confirm_password'
          render={({ field: { onChange } }) => (
              <Input 
                placeholder='Confirme nova senha'   
                bg='$gray600' 
                onChangeText={onChange}
                isPassword
                returnKeyType='send'
                onSubmitEditing={handleSubmit(handleProfileUpdate)}
                errorMessage={errors.confirm_password?.message}
              />
            )}
          />

        <Button 
         title='Atualizar'
         mt='$4'
         onPress={handleSubmit(handleProfileUpdate)}
         isLoading={isUpdating}
        />

        </Center>
      </Center>
    </ScrollView>
   </VStack>
  );
}