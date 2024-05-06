import Stack from '@mui/material/Stack';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Box from '@mui/material/Box';
import Autocomplete from '@mui/material/Autocomplete';

import { useTheme } from '@mui/material/styles';
import IconButton from '@mui/material/IconButton';

import { useOffSetTop } from 'src/hooks/use-off-set-top';
import { useResponsive } from 'src/hooks/use-responsive';

import { bgBlur } from 'src/theme/css';
import { useCombinedStore } from 'src/store';

import Logo from 'src/components/logo';
import SvgColor from 'src/components/svg-color';
import { useSettingsContext } from 'src/components/settings';

import Searchbar from '../common/searchbar';
import { NAV, HEADER } from '../config-layout';
import SettingsButton from '../common/settings-button';
import AccountPopover from '../common/account-popover';
// import ContactsPopover from '../common/contacts-popover';
// import LanguagePopover from '../common/language-popover';
import NotificationsPopover from '../common/notifications-popover';
import { useGetNamespaces } from 'src/api/namespace';
import { useCallback, useMemo } from 'react';
import TextField from '@mui/material/TextField';

// ----------------------------------------------------------------------

type Props = {
  onOpenNav?: VoidFunction;
};

export default function Header({ onOpenNav }: Props) {
  const theme = useTheme();

  const settings = useSettingsContext();
  const { namespace, updateNamespace } = useCombinedStore();
  const { namespaces } = useGetNamespaces();

  const isNavHorizontal = settings.themeLayout === 'horizontal';

  const isNavMini = settings.themeLayout === 'mini';

  const lgUp = useResponsive('up', 'lg');

  const offset = useOffSetTop(HEADER.H_DESKTOP);

  const offsetTop = offset && !isNavHorizontal;

  const getoptions = useMemo(
    () => namespaces.map((item: string) => ({ label: item, id: item })),
    [namespaces]
  );

  const changeNamespace = useCallback(
    (namespace: string) => {
      console.log('🚀 ~ Header ~ namespace:', namespace);
      updateNamespace(namespace);
    },
    [updateNamespace]
  );

  const renderContent = (
    <>
      {lgUp && isNavHorizontal && <Logo sx={{ mr: 2.5 }} />}

      {!lgUp && (
        <IconButton onClick={onOpenNav}>
          <SvgColor src="/assets/icons/navbar/ic_menu_item.svg" />
        </IconButton>
      )}

      <Searchbar />

      <Box sx={{ flexGrow: 1, display: 'flex', marginLeft: 8 }}>
        <Autocomplete
          size="small"
          disablePortal
          // default value
          value={namespace !== '' ? { label: namespace, id: namespace } : null}
          id="combo-box-demo"
          options={getoptions}
          isOptionEqualToValue={(option, value) => option?.id === value?.id}
          onChange={(event, newValue) => {
            console.log('🚀 ~ Header ~ newValue:', newValue);

            if (newValue) {
              changeNamespace(newValue?.label);
            } else {
              changeNamespace('');
            }
          }}
          // clear

          sx={{ width: 260 }}
          renderInput={(params) => <TextField {...params} label="namespace" />}
        />
      </Box>

      <Stack
        flexGrow={1}
        direction="row"
        alignItems="center"
        justifyContent="flex-end"
        spacing={{ xs: 0.5, sm: 1 }}
      >
        {/* <LanguagePopover /> */}

        <NotificationsPopover />

        {/* <ContactsPopover /> */}

        <SettingsButton />

        <AccountPopover />
      </Stack>
    </>
  );

  return (
    <AppBar
      sx={{
        height: HEADER.H_MOBILE,
        zIndex: theme.zIndex.appBar + 1,
        ...bgBlur({
          color: theme.palette.background.default,
        }),
        transition: theme.transitions.create(['height'], {
          duration: theme.transitions.duration.shorter,
        }),
        ...(lgUp && {
          width: `calc(100% - ${NAV.W_VERTICAL + 1}px)`,
          height: HEADER.H_DESKTOP,
          ...(offsetTop && {
            height: HEADER.H_DESKTOP_OFFSET,
          }),
          ...(isNavHorizontal && {
            width: 1,
            bgcolor: 'background.default',
            height: HEADER.H_DESKTOP_OFFSET,
            borderBottom: `dashed 1px ${theme.palette.divider}`,
          }),
          ...(isNavMini && {
            width: `calc(100% - ${NAV.W_MINI + 1}px)`,
          }),
        }),
      }}
    >
      <Toolbar
        sx={{
          height: 1,
          px: { lg: 5 },
        }}
      >
        {renderContent}
      </Toolbar>
    </AppBar>
  );
}
