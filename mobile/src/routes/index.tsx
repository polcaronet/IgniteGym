

import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import { Box } from '@gluestack-ui/themed';

import { AuthRoutes } from './auth.routes';

import { useAuth } from '@hooks/useAuth';


import { gluestackUIConfig } from '../../config/gluestack-ui.config';
import { AppRoutes } from "./app.routes";
import { Loading } from "@components/Loading";

export function Routes() {
  const { tokens } = gluestackUIConfig;
  const theme = DefaultTheme;
  theme.colors.background = tokens.colors.gray700;

  const { user, isLoadingUserStorageData } = useAuth();

if (isLoadingUserStorageData) {
  return <Loading />;
}

  return (
    <Box flex={1} bg="$gray700">
      <NavigationContainer theme={theme}>
       { user.id ? <AppRoutes /> : <AuthRoutes />}
      </NavigationContainer>
    </Box>
  );
}
 