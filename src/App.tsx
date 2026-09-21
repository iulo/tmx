import {createBrowserRouter, RouterProvider} from "react-router";
import {SWRConfig} from "swr";
import {MantineProvider} from "@mantine/core";
import {MantineEmotionProvider, emotionTransform} from "@mantine/emotion";
import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";
import {RecoilRoot} from "recoil";
import {useColorScheme} from "@mantine/hooks";
import {disableMenu} from "./utils";
import {MainLayout} from "./pages/main/MainLayout";
import {Stats} from "./pages/main/Stats";
import {SyncActionBatch} from "./states";
import {Directories} from "./pages/main/Directories";
import {General} from "./pages/main/General";
import {Scan} from "./pages/main/Scan";
import {Rules} from "./pages/main/Rules";
import {About} from "./pages/About";
import {Ack} from "./pages/Ack";
import {License} from "./pages/License";
import {Suspense} from "react";

const router = createBrowserRouter([
  {
    path: "main",
    element: <MainLayout/>,
    children: [
      {
        path: "stats",
        element: <Stats/>
      },
      {
        path: "directories",
        element: <Directories/>
      },
      {
        path: "general",
        element: <General/>
      },
      {
        path: "rules",
        element: <Rules/>
      },
      {
        path: "scan",
        element: <Scan/>,
      },
    ]
  },
  {
    path: "about",
    element: <About/>
  },
  {
    path: "ack",
    element: <Ack/>
  },
  {
    path: "license",
    element: <License/>
  }
]);

export const App = () => {
  const preferredColorScheme = useColorScheme();

  disableMenu();
  return (
    <SWRConfig
      value={{
        refreshInterval: 5000,
        refreshWhenOffline: true,
        revalidateOnReconnect: false
      }}
    >
      <MantineProvider
        stylesTransform={emotionTransform}
        forceColorScheme={preferredColorScheme === "dark" ? "dark" : "light"}
        theme={{
          components: {
            Text: {
              styles: {
                root: {
                  userSelect: "none",
                  cursor: "default",
                }
              }
            },
            Input: {
              defaultProps: {
                spellCheck: false
              }
            },
            Title: {
              styles: {
                root: {
                  userSelect: "none",
                  cursor: "default",
                }
              }
            },
            ScrollArea: {
              styles: (theme: import("@mantine/core").MantineTheme) => ({
                root: {
                  maxHeight: "100%",
                  borderStyle: "solid",
                  borderWidth: "1px",
                  borderRadius: theme.radius.xs,
                  borderColor: preferredColorScheme === 'dark' ? theme.colors.dark[4] : theme.colors.gray[2]
                },
              })
            },
            Button: {
              styles: (theme: import("@mantine/core").MantineTheme) => ({
                root: {
                  boxShadow: theme.shadows.xs,
                }
              })
            },
            Navbar: {
              styles: {
                root: {
                  zIndex: 250
                }
              }
            },
            Header: {
              styles: {
                root: {
                  zIndex: 251
                }
              }
            }
          }
        }}
      >
        <MantineEmotionProvider>
        <RecoilRoot>
          <SyncActionBatch/>
          <Suspense>
            <RouterProvider router={router}/>
          </Suspense>
        </RecoilRoot>
        </MantineEmotionProvider>
      </MantineProvider>
    </SWRConfig>
  )
}
