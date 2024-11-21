import { TouchableOpacity, ScrollView } from "react-native";
import { VStack, Icon, HStack, Heading, Text, Box, Image, useToast, Toast, ToastTitle, set } from "@gluestack-ui/themed";
import { ArrowLeft } from "lucide-react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { AppNavigatorRoutesProps } from "@routes/app.routes";
import BodySvg from '@assets/body.svg';
import SeriesSvg from '@assets/series.svg';
import RepetitionSvg from '@assets/repetitions.svg';
import { Button } from "@components/Button";
import { AppError } from "@utils/AppError";
import { api } from "@services/api";
import { ExerciseDTO } from "@dtos/ExerciseDTO";
import { useEffect, useState } from "react";
import { Loading } from "@components/Loading";

type RouteParamsProps = {
  exerciseId: string;
}

export function Exercise() {
  const [sendingRegister, setSendingRegister] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [exercise, setExercise] = useState<ExerciseDTO>({} as ExerciseDTO);
  const navigation = useNavigation<AppNavigatorRoutesProps>();
  
  const toast = useToast();
  const route = useRoute();
  
  const { exerciseId } = route.params as RouteParamsProps;


  function handleGoBack() {
    navigation.goBack();
  }

  async function fetchExerciseDetails() {
    try {
      setIsLoading(true);
      
      const response = await api.get(`/exercises/${exerciseId}`);
       setExercise(response.data);

    } catch (error) {
      const isAppError = error instanceof AppError;
      const title = isAppError ? error.message :
      'Não foi possível carregar os detalhes do exercício.'

      toast.show({
        placement: 'top',
        render: () => {
          return (
            <Toast
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
     } finally {
       setIsLoading(false);
     }
  }

  async function handleExerciseHistoryRegister() {
    try {
      setSendingRegister(true);
      await api.post('/history', { exercise_id: exerciseId });
      const title = 'Parabéns! Exercício registrado no seu histórico.';
      toast.show({
        placement: 'top',
        render: () => {
          return (
            <Toast
              backgroundColor='$green700'
              action='success'
              variant='outline'
              mt='$14'
            >
              <ToastTitle color='$white'>{title}</ToastTitle>
            </Toast>
          )
        }
     })
     
     navigation.navigate('history');
      
    } catch (error) {
      const isAppError = error instanceof AppError;
      const title = isAppError ? error.message :
      'Não foi possível registrar o exercício no seu histórico.';

      toast.show({
        placement: 'top',
        render: () => {
          return (
            <Toast
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
    } finally {
      setSendingRegister(false);
    }
  }

  useEffect(() => {
    fetchExerciseDetails();
  }, [exerciseId]);

  return (
    <VStack flex={1}>
      <VStack px='$8' bg='$gray600' pt='$12'>
        <TouchableOpacity onPress={handleGoBack}>
          <Icon as={ArrowLeft} color="$green500" size="xl"/>
        </TouchableOpacity>

        <HStack 
          justifyContent='space-between'
          alignItems='center' 
          mt='$4' 
          mb='$8'
          collapsable={true}
        > 
          <Heading 
            color='$gray100' 
            fontSize='$lg' 
            fontFamily='$heading'
            textTransform='capitalize'
            numberOfLines={2}
          >
            {exercise.name}
          </Heading>
        
          <HStack alignItems='center'>

            <BodySvg/>
            <Text 
              color='$gray200'
              ml='$1' 
              fontSize='$sm' 
              textTransform='capitalize'
              fontFamily='$heading'
              numberOfLines={2}
            >
              {exercise.group}
            </Text>
          </HStack>
        </HStack>
      </VStack>
     <ScrollView 
       showsVerticalScrollIndicator={false}
       contentContainerStyle={{ paddingBottom: 32 }}
     >
      { isLoading ? <Loading /> :
      <VStack p='$8'>
      <Box mb='$3' rounded='$lg' overflow='hidden'>
        <Image
          source={{ uri: `${api.defaults.baseURL}/exercise/demo/${exercise.demo}` }}
          w='$full' 
          h='$80' 
          alt='Exercício'
          resizeMode='cover'
        />
     </Box>
      <Box 
        bg='$gray600' 
        rounded='$md' 
        pb='$4' 
        px='$4'
      >   
        <HStack 
            alignItems='center' 
            justifyContent='space-around'
            mb='$6'
            mt='$5'
          >
        <HStack>
          <SeriesSvg />
          <Text color='$gray200' ml='$2'>3 séries</Text>
        </HStack>
        <HStack>
          <RepetitionSvg />
          <Text color='$gray200' ml='$2'>12 repetições</Text>
          </HStack>
          </HStack>
        <Button 
        title='Marcar como realizado'
        isLoading={sendingRegister}
        onPress={handleExerciseHistoryRegister}
        />
      </Box> 
      </VStack>
      }
    </ScrollView>
    </VStack>
  );
}
