import {motion} from "framer-motion";
import {useRecoilValue} from "recoil";
import {scanCurrentState} from "../../../states";
import {ActionIcon, Stack, Text, ThemeIcon, useMantineTheme} from "@mantine/core";
import {IconSearch, IconSquare} from "@tabler/icons-react";
import React from "react";
import {useAnimateStyles} from "../../../utils";
import {fadeAnimation} from "../../../transitions";
import {PathText} from "../../../components/PathText";
import {stopFullScan} from "../../../commands";
import {useTranslation} from "react-i18next";

export const InProgress = React.forwardRef(() => {
  const {t} = useTranslation();

  const {
    found,
    path
  } = useRecoilValue(scanCurrentState);
  const theme = useMantineTheme();
  const {classes} = useAnimateStyles();
  const moreDimmed = "light-dark(var(--mantine-color-gray-5), var(--mantine-color-dark-3))";

  return (
    <motion.div key={"inProgress"} style={{height: "100%"}} {...fadeAnimation}>
      <Stack py={"xl"} align={"center"} justify={"center"} sx={{height: "100%"}}>
        <ThemeIcon size={128} radius={64} variant={"gradient"}>
          <IconSearch size={72} strokeWidth={1} className={classes.circle}/>
        </ThemeIcon>
        <Stack gap={"xs"} align={"center"}>
          <Text size={"xl"}>{t('scanning_system')}</Text>
          <PathText size={"sm"} c={moreDimmed} ta={"center"} lineClamp={1} keepFirst={4} keepLast={2}
                    path={path}/>
          <Text size={"sm"} c={"dimmed"}>{t('found_files', {count: found})}</Text>
          <ActionIcon variant={"default"} radius={16} size={32} onClick={stopFullScan}>
            <IconSquare size={16} strokeWidth={1.5}/>
          </ActionIcon>
        </Stack>
      </Stack>
    </motion.div>)
});
