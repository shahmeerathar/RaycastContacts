import { List, ActionPanel, Action, getApplications, open } from "@raycast/api";
import { useEffect, useState } from "react";
import { execSync } from "child_process";

interface Contact {
    name: string;
}

export default function Command() {
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function fetchContacts() {
            try {
                // Use AppleScript to get contacts from the macOS Contacts app
                const script = `
                    set output to ""
                    tell application "Contacts"
                        repeat with p in people
                            set fullName to (get name of p)
                            set output to output & fullName & ","
                        end repeat
                    end tell
                    return output
                `;

                const result = execSync(`osascript -e '${script}'`, { encoding: 'utf8' });
                const contactNames = result.trim().split(',');

                const parsedContacts: Contact[] = contactNames
                    .filter(name => name.trim() !== '')
                    .map(name => ({
                        name: name.trim()
                    }))
                    .filter(contact => contact.name !== '');

                setContacts(parsedContacts);
            } catch (error) {
                console.error('Error fetching contacts:', error);
                setContacts([]);
            } finally {
                setIsLoading(false);
            }
        }

        fetchContacts();
    }, []);

    async function handleOpenContacts() {
        const applications = await getApplications();
        const contactsApp = applications.find(app => app.name === "Contacts");
        if (contactsApp) {
            open(contactsApp.path);
        }
    }

    return (
        <List isLoading={isLoading}>
            {contacts.map((contact, index) => (
                <List.Item
                    key={index}
                    title={contact.name}
                    actions={
                        <ActionPanel>
                            <Action
                                title="Open in Contacts App"
                                icon="👤"
                                onAction={handleOpenContacts}
                            />
                        </ActionPanel>
                    }
                />
            ))}
        </List>
    );
}
