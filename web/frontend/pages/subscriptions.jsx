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
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { useTranslation, Trans } from "react-i18next";
import { useAuthenticatedFetch, useAppQuery } from "../hooks";
import { useEffect, useMemo } from "react";

import { SubscriptionTable } from "../components";

export default function SubscriptionsPage() {
    const { t } = useTranslation();
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
    const rows = useMemo(() => {
        if (!isLoading && Array.isArray(data)) {
            return data;
        }
        return []
    }, [data, isLoading])
    return (
        <Page narrowWidth>
            <Layout.Section>
              <BlockStack gap={400}>
                <Text variant="headingLg">Subscriptions</Text>
                <SubscriptionTable
                      rows={rows}
                      selectable={false}
                      sortFields={{ Product: true, StockLevel: true }}
                      filterBar
                  />
              </BlockStack>
            </Layout.Section>
        </Page>
    );
}
