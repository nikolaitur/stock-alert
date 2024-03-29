import {
    IndexTable,
    IndexFilters,
    useSetIndexFiltersMode,
    useIndexResourceState,
    Text,
    Badge,
    Card,
    Image,
    InlineStack,
    BlockStack,
    Box,
} from "@shopify/polaris";
import { Link } from "react-router-dom";
import React, { useState, useCallback,useEffect } from "react";
import { trophyImage } from "../assets";

export function SubscriptionTable({ selectable, filterBar, rows }) {
    const subscriptionTableRows = rows;
    const { selectedResources, allResourcesSelected, handleSelectionChange } =
        useIndexResourceState(subscriptionTableRows);
    const subscriptionTableHeadings = [
        { title: "" },
        { title: "Product" },
        { title: "Variant" },
        { title: "Stock level" },
        { title: "    " },
        { title: "Subscriptions" },
    ];
    console.log(rows);
    const rowMarkup = subscriptionTableRows.map(
        (
            { id, product_title, variant_title, stockLevel, subscriptions, featuredImage },
            index
        ) => (
            <IndexTable.Row
                id={id}
                key={id}
                position={index}
                selected={selectedResources.includes(id)}
            >
                <IndexTable.Cell flush>
                    <Box padding="150" paddingInline='0'>
                        <Box
                            padding="0"
                            borderColor="border"
                            borderStyle="solid"
                            borderRadius="200"
                            borderWidth="0165"
                            overflowX="hidden"
                            overflowY="hidden"
                            maxWidth='40px'
                            minWidth="40px"
                            minHeight=""
                        >
                            <BlockStack>
                                <Image
                                    source={featuredImage}
                                    width='100%'
                                    height='100%'
                                />
                            </BlockStack>
                        </Box>
                    </Box>
                </IndexTable.Cell>
                <IndexTable.Cell>
                    <Text variant="headingSm">{product_title}</Text>
                </IndexTable.Cell>
                <IndexTable.Cell>{variant_title}</IndexTable.Cell>
                <IndexTable.Cell flush>
                    <Text variant="headingSm" alignment="end">
                        {stockLevel}
                    </Text>
                </IndexTable.Cell>
                <IndexTable.Cell></IndexTable.Cell>
                <IndexTable.Cell>
                    <Link to={`/subscriptionDetail/${ id }`}>
                        <Text variant="headingSm">{ subscriptions }</Text>
                    </Link>
                </IndexTable.Cell>
            </IndexTable.Row>
        )
    );

    const displayProductsCountLabel = [
        {
            content: 'All',
            id: "All-0",
            actions: [],
            onAction: () => {},
            index: 0,
            isLocked: false,
        },
    ];
    const { mode, setMode } = useSetIndexFiltersMode();
    const onHandleCancel = () => {};
    const [queryValue, setQueryValue] = useState("");
    const handleFiltersQueryChange = useCallback(
        (value) => setQueryValue(value),
        []
    );
    
    return (
        <Card key="indextableheader">
            {filterBar && (
                <IndexFilters
                    queryValue={queryValue}
                    queryPlaceholder="Search in all"
                    onQueryChange={handleFiltersQueryChange}
                    onQueryClear={() => setQueryValue("")}
                    cancelAction={{
                        onAction: onHandleCancel,
                        disabled: false,
                        loading: false,
                    }}
                    selected={0}
                    tabs={displayProductsCountLabel}
                    canCreateNewView={false}
                    filters={[]}
                    mode={mode}
                    setMode={setMode}
                />
            )}
            <IndexTable
                itemCount={subscriptionTableRows.length}
                headings={subscriptionTableHeadings}
                selectable={selectable}
                selectedItemsCount={
                    allResourcesSelected ? "All" : selectedResources.length
                }
                sortable={[false, true, true, true, false, true]}
                onSelectionChange={handleSelectionChange}
            >
                {rowMarkup}
            </IndexTable>
        </Card>
    );
}
