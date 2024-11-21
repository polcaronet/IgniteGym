import { useCallback, useEffect, useState } from 'react';
import { FlatList } from 'react-native';
import { Heading, HStack, Text, Toast, ToastTitle, useToast, VStack } from '@gluestack-ui/themed';

import { api } from '@services/api';
import { AppError } from '@utils/AppError';
import { ExerciseDTO } from '@dtos/ExerciseDTO';

import { HomeHeader } from '@components/HomeHeader';
import { Group } from '@components/Group';
import { ExerciseCard } from '@components/ExerciseCard';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { AppNavigatorRoutesProps } from '@routes/app.routes';
import { Loading } from '@components/Loading';

export function Home() {
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [exercises, setExercises] = useState<ExerciseDTO[]>([]);
  const [groups, setGroups] = useState<string[]>([]);
  const [groupSelected, setGroupSelected] = useState("antebraço");

  const navigation = useNavigation<AppNavigatorRoutesProps>();

  function handleOpenExerciseDetails(exerciseId: string) {
    navigation.navigate('exercise', { exerciseId });
  }

 async function fetchGroups() {
    try {
      const response = await api.get('/groups');
      setGroups(response.data);
      
    } catch (error) {
      const isAppError = error instanceof AppError;
      const title = isAppError ? error.message :
      'Não foi possível carregar os grupos musculares.'

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
    }
  }

  async function fecthExercisesByGroup() {
    try {
      setIsLoading(true);

      const response = await api.get(`/exercises/bygroup/${groupSelected}`);
      setExercises(response.data);

    } catch (error) {
      const isAppError = error instanceof AppError;
      const title = isAppError ? error.message : 'Não foi possível carregar os exercícios';

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
     
  
  useEffect(() => {
    fetchGroups();
  },[]);

  useFocusEffect(
    useCallback(() => {
      fecthExercisesByGroup();
    },[groupSelected]));
  

  return (
   <VStack flex={1}>
    <HomeHeader />

    <FlatList
      data={groups}
      keyExtractor={(item) => item}
      renderItem={({ item }) => (
       <Group 
         name={item}
         isActive={groupSelected.toLowerCase() === item.toLowerCase()}
         onPress={() => setGroupSelected(item)}   
        />
      )} 
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 15 }}
      style={{ marginVertical: 30, maxHeight: 44, minHeight: 44 }}
    />
    {
      isLoading ? <Loading /> :
      <VStack px='$8' flex={1}>
       <HStack justifyContent='space-between' mb='$5' alignItems='center'>
        <Heading color='$gray200' fontSize='$md' fontFamily='$heading'>
          Exercícios
        </Heading>

        <Text color='$gray200' fontSize='$sm' fontFamily='$body'>
          {exercises.length}
        </Text>
       </HStack>
        
        <FlatList
           data={exercises}
           keyExtractor={(item) => item.id}
           renderItem={(({ item }) => <ExerciseCard  
           data={item} onPress={() => handleOpenExerciseDetails(item.id)}/> )}
           showsVerticalScrollIndicator={false}
           contentContainerStyle={{ paddingBottom: 20 }}
        />
      </VStack>
    }
   </VStack>
  );
}