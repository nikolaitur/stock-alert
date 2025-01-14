import {
    Page,
    Layout,
    IndexTable,
    Text,
    Card,
    Image,
    InlineStack,
    BlockStack,
    useBreakpoints,
    useIndexResourceState,
    Box,
} from "@shopify/polaris";
import React, { useState, useEffect } from "react";
import { useAuthenticatedFetch, useAppQuery } from "../hooks";
import { useTranslation, Trans } from "react-i18next";
import { useParams } from "react-router-dom";
import { trophyImage } from "../assets";

const getFormatedDate = (d) => {
    return d.getFullYear() + "-" + ("0"+(d.getMonth()+1)).slice(-2) + "-" +
    ("0" + d.getDate()).slice(-2) + " " + ("0" + d.getHours()).slice(-2) + ":" + ("0" + d.getMinutes()).slice(-2);

}

export default function SubscriptionDetail() {
    const { t } = useTranslation();
    const { id } = useParams();
    const fetch = useAuthenticatedFetch();
    const [sortState, setSortState] = useState(2); //0 no sortable data,1 dec sort,2 asc
    const [productInfo, setProductInfo] = useState({
        featuredImage: trophyImage,
        product_title: '',
        variant_title: '',
        stockLevel: '',
    });
    const [subscribers, setSubscribers] = useState([]);

    useEffect(() => {
        (async() => {
          const response = await fetch(`/api/subscriptions/${ id }`);
          const result = await response.json();
          console.log(result);
          setProductInfo(result?.alert);
          setSubscribers(result?.customers);
        
        })()
      }, [id])
    
    
    const SubscriptionDetailHeader = [
        {
            title: "Email",
        },
        { title: "Subscription Date", alignment: "end" },
    ];

    const { selectedResources, allResourcesSelected, handleSelectionChange } =
        useIndexResourceState(subscribers);
    const rowMarkup = subscribers.map(
        ({ id, email, created_at }, index) => (
            <IndexTable.Row
                key={id}
                id={id}
                position={index}
            >
                <IndexTable.Cell as="th">{email}</IndexTable.Cell>
                <IndexTable.Cell as="th">
                    <Text alignment="end">{created_at ? getFormatedDate(new Date(created_at)): null}</Text>
                </IndexTable.Cell>
            </IndexTable.Row>
        )
    );
    return (
        <Page narrowWidth>
            <Layout.Section>
                <BlockStack gap={400}>
                    <Text variant="headingLg">{ t("SubscriptionDetail.product_subscriptions") }</Text>
                    <Card>
                        <InlineStack align="space-between" blockAlign="center">
                            <InlineStack gap={400}>
                                <InlineStack>
                                    <Box padding="150" paddingInline="0">
                                        <Box
                                            padding="0"
                                            borderColor="border"
                                            borderStyle="solid"
                                            borderRadius="200"
                                            borderWidth="0165"
                                            overflowX="hidden"
                                            overflowY="hidden"
                                            maxWidth="50px"
                                            minWidth="50px"
                                            minHeight=""
                                        >
                                            <BlockStack>
                                                <Image
                                                    source={productInfo.featuredImage}
                                                    width="100%"
                                                    height="100%"
                                                />
                                            </BlockStack>
                                        </Box>
                                    </Box>
                                </InlineStack>
                                <BlockStack>
                                    <Text variant="headingSm">{ productInfo.product_title }</Text>
                                    <Text>{ productInfo.variant_title }</Text>
                                </BlockStack>
                            </InlineStack>
                            <BlockStack>
                                <Text variant="headingSm">{ t("SubscriptionDetail.stock_level") }</Text>
                                <Text alignment="end">{ productInfo.stockLevel }</Text>
                            </BlockStack>
                        </InlineStack>
                    </Card>
                    <Card>
                        <IndexTable
                            headings={SubscriptionDetailHeader}
                            itemCount={rowMarkup.length}
                            selectable={false}
                            condensed={useBreakpoints().smDown}
                            selectedItemsCount={
                                allResourcesSelected
                                    ? "All"
                                    : selectedResources.length
                            }
                            onSelectionChange={handleSelectionChange}
                            sortable={[true, false]}
                        >
                            {rowMarkup}
                        </IndexTable>
                    </Card>
                </BlockStack>
            </Layout.Section>
        </Page>
    );
}
