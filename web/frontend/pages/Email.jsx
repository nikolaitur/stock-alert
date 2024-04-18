import {
    BlockStack,
    InlineStack,
    Card,
    Button,
    Text,
    TextField,
    Layout,
    Page
} from '@shopify/polaris';
import {
    useState,
    useCallback
} from 'react';

export default function Email() {
    const [emailSubject, setEmailSubject] = useState('');
    const [emailContent, setEmailContent] = useState('');
    return (
        <Page narrowWidth>
            <Layout.Section>
                <Card padding={800}>
                    <BlockStack gap={400}>
                        <BlockStack gap={300}>
                            <TextField
                                label='Email Subject'
                                value={emailSubject}
                                onChange={(value) => { setEmailSubject(value) }} />
                            <TextField
                                label='Email body (HTML)'
                                value={emailContent}
                                onChange={(value) => { setEmailContent(value) }}
                                multiline={24}
                                maxHeight={586}
                                // multiline={10}
                            />
                        </BlockStack>
                        <InlineStack>
                            <Button>Revert to default</Button>
                        </InlineStack>
                    </BlockStack>
                </Card>
            </Layout.Section>
        </Page>
    );
}