import { useState } from 'react';
import { ComponentProps } from 'react';
import {
  Input as GluestackInput,
  InputField,
  FormControl,
  FormControlError,
  FormControlErrorText,
} from '@gluestack-ui/themed';
import { TouchableOpacity } from 'react-native';
import { Eye, EyeOff } from 'lucide-react-native'; 

type Props = ComponentProps<typeof InputField> & {
  errorMessage?: string | null;
  isInvalid?: boolean;
  isReadOnly?: boolean;
  isPassword?: boolean;
};

export function Input({
  isReadOnly = false,
  errorMessage = null,
  isInvalid = false,
  isPassword = false,
  ...rest
}: Props) {
  const [showPassword, setShowPassword] = useState(false);
  const invalid = !!errorMessage || isInvalid;

  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  return (
    <FormControl isInvalid={invalid} w="$full" mb="$4">
      <GluestackInput
        isInvalid={invalid}
        borderWidth="$0"
        h="$14"
        borderRadius="$md"
        $focus={{
          borderWidth: '$1',
          borderColor: invalid ? '$red500' : '$green500',
        }}
        $invalid={{
          borderWidth: '$1',
          borderColor: '$red500',
        }}
        isReadOnly={isReadOnly}
        opacity={isReadOnly ? 0.56 : 1}
      >
        <InputField
          px="$4"
          bg="$gray700"
          color="$white"
          fontFamily="$body"
          placeholderTextColor="$gray300"
          secureTextEntry={isPassword && !showPassword} 
          {...rest}
        />
        {isPassword && (
          <TouchableOpacity
            onPress={togglePasswordVisibility}
            style={{
              position: 'absolute',
              right: 16,
              top: '50%',
              transform: [{ translateY: -12 }],
            }}
          >
            {showPassword ? (
              <EyeOff width={24} height={24} color="#047857" />
            ) : (
              <Eye width={24} height={24} color="#059669" />
            )}
          </TouchableOpacity>
        )}
      </GluestackInput>
      <FormControlError>
        <FormControlErrorText color="$red500">
          {errorMessage}
        </FormControlErrorText>
      </FormControlError>
    </FormControl>
  );
}
