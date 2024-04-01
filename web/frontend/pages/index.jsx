import {
  Card,
  Page,
  Layout,
  TextContainer,
  Image,
  Link,
  Text,
  Badge,
  Button,
  ButtonGroup,
  IndexTable,
  BlockStack,
  InlineStack,
  DataTable,
  Box
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { useTranslation, Trans } from "react-i18next";
import { SubscriptionTable } from "../components";
import { useAuthenticatedFetch, useAppQuery } from "../hooks";
import { useEffect, useMemo, useState } from "react";

export default function HomePage() {
  const { t } = useTranslation();
  // let rows = [];
  const fetch = useAuthenticatedFetch();
  const [ appEnabled, setAppEnabled ] = useState(false);
  const [liveThemeId, setLiveThemeId] = useState('');
  const [shopDomain, setShopDomain] = useState('');

  const {
    data,
    refetch: refetchProductCount,
    isLoading: isLoading,
    isRefetching: isRefetchingCount,
  } = useAppQuery({
    url: "/api/alerts",
    reactQueryOptions: {
      onSuccess: () => {
        // setIsLoading(false);
      },
    },
  });

  useEffect(() => {
    //   await fetch('/api/app/enable');

    (async() => {
        const res = await fetch('/api/app/status');
        if(res.ok) {
            const resJSON = await res.json();
            console.log(resJSON);
            const liveTheme = resJSON.themes.filter((theme) => theme.role === 'main')
            setLiveThemeId(liveTheme[0].id);
            setShopDomain(resJSON.shop);
            setAppEnabled(resJSON.is_enable === '1');
        }
    })();
  }, [])

  const disableApp = async () => {
    await fetch('/api/app/disable');
    setAppEnabled(false);
  }

  const enableApp = async () => {
    await fetch('/api/app/enable');
    setAppEnabled(true);
  }

  const rows = useMemo(() => {
    if (!isLoading && Array.isArray(data)) {
      return data;
    }
    return []
  }, [data, isLoading])

  return (
    <Page narrowWidth>
        <Layout.Section>
            <BlockStack gap={600}>
                <BlockStack gap={400}>
                    <Text as="h1" variant="headingLg">
                        { t("HomePage.heading") }
                    </Text>
                    <Card sectioned>
                        <BlockStack gap={100}>
                            <InlineStack align="space-between">
                                <InlineStack gap={400} blockAlign="center">
                                    <Text as="h2" variant="headingMd">
                                        { t("HomePage.heading") }
                                    </Text>
                                    {
                                        appEnabled ? (
                                            <Badge tone="success" size="medium">
                                                <Text variant="headingXs">
                                                    { t("HomePage.enabled") }
                                                </Text>
                                            </Badge>
                                        ) : (
                                            <Badge size="medium">
                                                <Text variant="headingXs">
                                                    { t("HomePage.disabled") }
                                                </Text>
                                            </Badge>
                                        )
                                    }
                                    
                                </InlineStack>
                                {
                                        appEnabled ? (
                                            <Button size="medium" onClick={disableApp}>
                                                <Text variant="headingXs">{ t("HomePage.disable") }</Text>
                                            </Button>
                                        ) : (
                                            <Button size="medium" onClick={enableApp}>
                                                <Text variant="headingXs">{ t("HomePage.enable") }</Text>
                                            </Button>
                                        )
                                    }
                                
                            </InlineStack>
                            <Text color="subdued">
                                { appEnabled ? t("HomePage.disable_alert") : t("HomePage.enable_alert") }
                            </Text>
                        </BlockStack>
                    </Card>
                    {
                        appEnabled && (<Card sectioned>
                            <BlockStack gap={150}>
                                <Text variant="headingMd" as="h2">
                                    { t("HomePage.add_to_theme_editor") }
                                </Text>
                                <BlockStack gap={100}>
                                    <Text color="subdued">
                                        { t("HomePage.app_is_enabled") }
                                    </Text>
                                    <InlineStack>
                                        <Link url={`https://${shopDomain}/admin/themes/${liveThemeId}/editor?context=apps`} target="_blank">
                                            <Button
                                                variant="primary"
                                                fullWidth={false}
                                            >
                                                { t("HomePage.add_to_theme") }
                                            </Button>
                                        </Link>
                                    </InlineStack>
                                </BlockStack>
                            </BlockStack>
                        </Card>)
                }
                </BlockStack>
                {
                    appEnabled && (
                        <BlockStack gap={400}>
                            <InlineStack align="space-between">
                                <Text variant="headingLg">
                                    { t("HomePage.recent_subscriptions") }
                                </Text>
                                <Link url="/subscriptions">
                                <Button>
                                    <Box minWidth="64px" maxWidth="64px">
                                    <Text variant="headingXs">{ t("HomePage.show_all") }</Text>
                                    </Box>
                                </Button>
                                </Link>
                            </InlineStack>
                            <SubscriptionTable rows={rows} selectable={false}/>
                        </BlockStack>
                    )
                }
                
            </BlockStack>
        </Layout.Section>
    </Page>
  );
}
