import { Heading, Image, VStack, Text, HStack, Icon } from '@gluestack-ui/themed';
import { TouchableOpacity, TouchableOpacityProps } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import { ExerciseDTO } from '@dtos/ExerciseDTO';
import { api } from '@services/api';

type Props = TouchableOpacityProps & { 
  data: ExerciseDTO;
}

export function ExerciseCard({ data, ...rest }: Props) {
  return (
    <TouchableOpacity {...rest}>
      <HStack 
        flex={1}
        bg='$gray500' 
        alignItems='center'
        justifyContent='space-around' 
        p='$2' 
        pr='$4' 
        mb='$3'
        rounded='$md'
      >
        <Image
          source={{ uri: `${api.defaults.baseURL}/exercise/thumb/${data.thumb}` }}
          w='$16' 
          h='$16' 
          alt='Imagem do exercício'
          rounded='$md'
          mr='$4'
          resizeMode='cover'
        />
        <VStack flex={1}>
          <Heading 
            fontSize='$lg' 
            color='$white' 
            fontFamily='$heading'
            numberOfLines={2}
          >
            {data.name}
          </Heading>
          <Text 
            fontSize='$sm' 
            color='$gray200'
            mt='$1'
            numberOfLines={2}
            gap='$1'
          >
            {data.series} séries x {data.repetitions} repetições
          </Text>
        </VStack>
        <Icon as={ChevronRight} color='$gray300'/>
      </HStack>
    </TouchableOpacity>
  )
}