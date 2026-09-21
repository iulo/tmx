import {Box, NavLink, Text} from "@mantine/core";
import {Fragment} from "react";
import {routes} from "./routes";
import {Link, useLocation} from "react-router";
import {evDrag} from "../../utils";
import {useTranslation} from "react-i18next";

export const NavBar = () => {
  const {t} = useTranslation();
  const location = useLocation();

  return (
    <Box w={250} h={600} p="xs"
            styles={{
              root: {
                background: "transparent",
                boxShadow: "-3px 0px 3px -3px rgba(0,0,0,0.1) inset"
              }
            }}>
      <Box sx={{height: 40}} onMouseDown={evDrag}/>
      {routes(t).map((section, idx) => (section.kind === "link" ? <Fragment key={`nav-${idx}`}>
        <Box>
          <Link key={`link-${section.title}`} to={section.href} style={{textDecoration: "none"}}>
            <NavLink
              component={"div"}
              leftSection={section.icon}
              label={section.title}
              color={"dark"}
              active={location.pathname === section.href}
              sx={(theme) => ({borderRadius: theme.radius.sm})}
              styles={{
                label: {
                  cursor: "pointer"
                }
              }}
              py={3}
            />
          </Link>
        </Box>
      </Fragment> : <Fragment key={`nav-${idx}`}>
        <Box>
          <Text size={"sm"} fw={500} c={"dimmed"} px={"xs"} py={5}>{section.title}</Text>
        </Box>
      </Fragment>))}
    </Box>);
}