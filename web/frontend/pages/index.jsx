import {
  Card,
  Page,
  Layout,
  TextContainer,
  Image,
  Stack,
  Link,
  Text,
  Badge,
  Button,
  ButtonGroup,
  DataTable,
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { useTranslation, Trans } from "react-i18next";

import { trophyImage } from "../assets";

import { ProductsCard } from "../components";

export default function HomePage() {
  const { t } = useTranslation();
  let rows = [];
  const dataTableHeadings = ['   ', 'Product', 'Variant', 'Stock level', 'Subscriptions'];
  const columnDataTypes = ['text', 'text', 'numeric', 'numeric'];
  for (let i = 0; i < 10; i++) {
    let random = Math.round(Math.random() * 10000);
    rows.push([ `Product title ${i}`, `Variant title ${i}`, i.toString(), <Link url=" ">{random}</Link>]);
  }
  return (
    <Page narrowWidth>
      <Layout.Section>
        <Card sectioned>
          <Stack
            wrap={false}
            spacing="extraTight"
            distribution="trailing"
            alignment="center"
          >
            <Stack.Item fill>
              <ButtonGroup>
                <Text as="h2" variant="headingMd">
                  Stock Alerts
                </Text>
                <Badge status="success" size="medium">Enable</Badge>
              </ButtonGroup>
            </Stack.Item>
            <Stack.Item>
              <Button size="micro">Disable</Button>
            </Stack.Item>
          </Stack>
          <Text color="subdued">Disabling Stock Alert will disbble the option for user to opt-in to stock-alerts.</Text>
        </Card>
        <Card sectioned>
          <Text variant="headingMd" as='h2'>Add to Shopify theme editor</Text>
          <Text color="subdued">The app is currently enabled, so you can add it to your Shopify theme editor.</Text>
          <Button>Add to theme</Button>
        </Card>
      </Layout.Section>
      <Layout.Section>
        <Stack >
          <Stack.Item fill>
            <Text variant="headingXl">Recent subscriptions</Text>
          </Stack.Item>
          <Stack.Item><Button>Show All</Button></Stack.Item>
        </Stack>
      </Layout.Section>
      <Layout.Section>
        <DataTable
          columnContentTypes={['text', 'text', 'numeric', 'numeric']}
          headings={['Product', 'Variant', 'Stock level', 'Subscriptions']}
          rows={rows}
        />
      </Layout.Section>
      {/* <TitleBar title={t("HomePage.title")} primaryAction={null} />
      <Layout>
        <Layout.Section>
          <Card sectioned>
            <Stack
              wrap={false}
              spacing="extraTight"
              distribution="trailing"
              alignment="center"
            >
              <Stack.Item fill>
                <TextContainer spacing="loose">
                  <Text as="h2" variant="headingMd">
                    {t("HomePage.heading")}
                  </Text>
                  <p>
                    <Trans
                      i18nKey="HomePage.yourAppIsReadyToExplore"
                      components={{
                        PolarisLink: (
                          <Link url="https://polaris.shopify.com/" external />
                        ),
                        AdminApiLink: (
                          <Link
                            url="https://shopify.dev/api/admin-graphql"
                            external
                          />
                        ),
                        AppBridgeLink: (
                          <Link
                            url="https://shopify.dev/apps/tools/app-bridge"
                            external
                          />
                        ),
                      }}
                    />
                  </p>
                  <p>{t("HomePage.startPopulatingYourApp")}</p>
                  <p>
                    <Trans
                      i18nKey="HomePage.learnMore"
                      components={{
                        ShopifyTutorialLink: (
                          <Link
                            url="https://shopify.dev/apps/getting-started/add-functionality"
                            external
                          />
                        ),
                      }}
                    />
                  </p>
                </TextContainer>
              </Stack.Item>
              <Stack.Item>
                <div style={{ padding: "0 20px" }}>
                  <Image
                    source={trophyImage}
                    alt={t("HomePage.trophyAltText")}
                    width={120}
                  />
                </div>
              </Stack.Item>
            </Stack>
          </Card>
        </Layout.Section>
        <Layout.Section>
          <ProductsCard />
        </Layout.Section>
      </Layout> */}
    </Page>
  );
}
