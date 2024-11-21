import { ComponentProps } from 'react';
import { 
  Input as GluestackInput, 
  InputField, 
  FormControl, 
  FormControlError, 
  FormControlErrorText,
} from '@gluestack-ui/themed';


type Props = ComponentProps<typeof InputField> & {
  errorMessage?: string | null;
  isInvalid?: boolean;
  isReadOnly?: boolean;
}

export function Input({ 
  isReadOnly = false, 
  errorMessage = null, 
  isInvalid = false, 
  ...rest }: Props) {
  const invalid = !!errorMessage || isInvalid; 

  return (
   <FormControl isInvalid={invalid} w='$full' mb='$4'>
    <GluestackInput 
       isInvalid={invalid}
       borderWidth ='$0' 
       h='$14' 
       
       borderRadius='$md'
       $focus={{
         borderWidth: '$1',
         borderColor:  invalid ? '$red500' : '$green500'
       }}
       $invalid={{
         borderWidth: '$1',
         borderColor: '$red500'
       }}
       isReadOnly={isReadOnly}
       opacity={isReadOnly ? 0.56 : 1}
    >
      <InputField 
         px='$4'
         bg='$gray700' 
         color='$white'
         fontFamily='$body'
         placeholderTextColor='$gray300'
         {...rest} 
      />
    </GluestackInput>
     <FormControlError>
      <FormControlErrorText color='$red500'>
       {errorMessage}
     </FormControlErrorText>
    </FormControlError>
   </FormControl>
  );
}
