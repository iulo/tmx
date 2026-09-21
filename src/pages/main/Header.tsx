import {useRecoilValue, useResetRecoilState} from "recoil";
import {configChangedState, draftConfigState} from "../../states";
import {Box, Button, Group, Text, Tooltip} from "@mantine/core";
import {IconAdjustments, IconAlertTriangle} from "@tabler/icons-react";
import React, {useState} from "react";
import {evDrag} from "../../utils";
import {useTranslation} from "react-i18next";
import {setConfig} from "../../commands";

export const MainHeader = React.forwardRef<HTMLDivElement>((props, ref) => {
  const {t} = useTranslation();

  const changed = useRecoilValue(configChangedState);
  const resetDraft = useResetRecoilState(draftConfigState);
  const draftConfig = useRecoilValue(draftConfigState);

  const [error, setError] = useState<string | null>(null);

  const updateFinalConfig = async () => {
    if (draftConfig !== null) {
      try {
        await setConfig(draftConfig);
      } catch (_e: any) {
        const e = _e as string;
        setError(e);
      }
    }
  };

  const resetDraftConfig = () => {
    setError(null);
    resetDraft();
  }

  return (
    <Box ref={ref} h={55} p="xs"
            styles={(theme) => ({
              root: {
                background: "light-dark(#F6F2F9, #38343C)",
              }
            })}
            onMouseDown={evDrag}>
      <Group gap={"xs"} p={5} sx={(theme) => ({
        color: "light-dark(inherit, #ffffff)",
        alignItems: "flex-start"
      })}>
        <Box sx={{
          height: 20,
          width: 20
        }} pt={2}>
          <IconAdjustments size={20} strokeWidth={1.5}/>
        </Box>
        <Text size={"md"}>{t('preference')}</Text>
        {changed && <>
          <Box sx={{flexGrow: 1}}/>
          <Button variant={"subtle"} size="compact-xs" sx={{boxShadow: "none"}}
                  onClick={() => resetDraftConfig()}>
            {t('reset')}
          </Button>
          <Tooltip color={"orange"} label={error ?? ""} disabled={error === null} withArrow>
            <Button color={error !== null ? "orange" : undefined} size="compact-xs"
                    leftSection={error !== null && <IconAlertTriangle color={"white"} size={16} strokeWidth={1.5}/>}
                    onClick={() => updateFinalConfig()}>
              {t('save')}
            </Button>
          </Tooltip>
        </>}
      </Group>
    </Box>)
});