import {useCallback, useEffect, useState} from 'react';
import {toast} from "../../../../utils/toast";
import {SendGridService} from "../../../../services/newsletter/SendGridService";
import {EmailTemplate, EmailTemplateType, SavedEmailTemplate, TargetedEmailParams} from "../../../../types/send-grid";
import LoadingSpinner from "../../../common/LoadingSpinner";
import EmailTemplateSelector from "./EmailTemplateSelector";
import {EmailTemplateService} from "../../../../services/newsletter/temlates/EmailTemplateService";
import debounce from "lodash/debounce";
import EmailPreview from './EmailPreview';
import EmailContentEditor from "./EmailContentEditor";
import {AdminNewsletterService} from "../../../../services/newsletter";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "../../../ui/Tabs";
import {Settings} from "lucide-react";
import SavedTemplatesSelector from "./SavedTemplatesSelector";
import ExternalRecipientFilters from "./filters/ExternalRecipientFilters";
import RecipientTypeSelector from "./RecipientTypeSelector";
import SubscriberFilters from "./filters/SubscriberFilters";
import {ExternalRecipientService} from "../../../../services/newsletter/ExternalRecipientService";
import {SavedTemplateService} from "../../../../services/newsletter/temlates/SavedTemplateService";

const BulkEmailSender = () => {
    // Podstawowe stany
    const [subject, setSubject] = useState('');
    const [content, setContent] = useState('');
    const [useTemplate, setUseTemplate] = useState(true);
    const [templateType, setTemplateType] = useState<EmailTemplateType>('basic');
    const [recipientType, setRecipientType] = useState<'subscribers' | 'external' | 'mixed'>('subscribers');
    const [isSending, setIsSending] = useState(false);
    const [previewContent, setPreviewContent] = useState('');
    const [isLoadingPreview, setIsLoadingPreview] = useState(false);

    // Stany szablonów
    const [isLoadingTemplates, setIsLoadingTemplates] = useState(false);
    const [availableTemplates, setAvailableTemplates] = useState<EmailTemplate[]>([]);
    const [savedTemplates, setSavedTemplates] = useState<SavedEmailTemplate[]>([]);
    const [selectedSavedTemplateId, setSelectedSavedTemplateId] = useState<string | null>(null);
    const [isLoadingSavedTemplates, setIsLoadingSavedTemplates] = useState(false);

    // Stany filtrów
    const [subscriberFilters, setSubscriberFilters] = useState({
        role: 'all',
        active: true,
        verified: true
    });

    const [externalFilters, setExternalFilters] = useState({
        category: 'all',
        status: 'all',
        tags: [] as string[]
    });

    const [externalRecipientIds, setExternalRecipientIds] = useState<string[]>([]);
    const [useSelectedExternalIds, setUseSelectedExternalIds] = useState(false);

    // Stany dla opcji aktualizacji statusu
    const [updateStatus, setUpdateStatus] = useState(false);
    const [newStatus, setNewStatus] = useState<'contacted' | 'responded' | 'subscribed' | 'rejected'>('contacted');

    // Stany statystyk
    const [subscribersCount, setSubscribersCount] = useState(0);
    const [externalCount, setExternalCount] = useState(0);
    const [isLoadingCounts, setIsLoadingCounts] = useState(false);

    // Kategorie dla zewnętrznych odbiorców
    const [categories, setCategories] = useState<string[]>([]);
    const [isLoadingCategories, setIsLoadingCategories] = useState(false);

    // Zbieramy dane przy inicjalizacji
    useEffect(() => {
        fetchTemplates().catch(console.error);
        fetchSavedTemplates().catch(console.error);
        fetchCategories().catch(console.error);
        updateRecipientCounts().catch(console.error);
    }, []);

    const debouncedPreview = useCallback(
        debounce(() => {
            if (content.trim()) {
                handlePreview()
                    .catch(error => console.error('Błąd podczas generowania podglądu:', error));
            }
            return Promise.resolve();
        }, 500),
        [useTemplate, templateType, content, selectedSavedTemplateId]
    );

    useEffect(() => {
        let isMounted = true;

        if (content.trim()) {
            setIsLoadingPreview(true);

            const previewPromise = debouncedPreview();
            if (previewPromise) {
                previewPromise.catch(error => {
                    if (isMounted) {
                        console.error('Błąd podczas obsługi podglądu:', error);
                    }
                });
            }
        }

        return () => {
            isMounted = false;
            debouncedPreview.cancel();
        };
    }, [useTemplate, templateType, content, selectedSavedTemplateId, debouncedPreview]);

    // Aktualizacja liczby potencjalnych odbiorców
    useEffect(() => {
        updateRecipientCounts().catch(console.error);
    }, [recipientType, subscriberFilters, externalFilters, useSelectedExternalIds, externalRecipientIds]);

    // Pobieranie listy dostępnych szablonów
    const fetchTemplates = async () => {
        try {
            setIsLoadingTemplates(true);
            const templates = await EmailTemplateService.getTemplates();
            setAvailableTemplates(templates);
        } catch (error) {
            console.error('Błąd podczas pobierania szablonów:', error);
        } finally {
            setIsLoadingTemplates(false);
        }
    };

    // Pobieranie zapisanych szablonów
    const fetchSavedTemplates = async () => {
        try {
            setIsLoadingSavedTemplates(true);
            const response = await SavedTemplateService.getAllTemplates();
            setSavedTemplates(response);
        } catch (error) {
            console.error('Błąd podczas pobierania zapisanych szablonów:', error);
        } finally {
            setIsLoadingSavedTemplates(false);
        }
    };

    // Pobieranie kategorii dla zewnętrznych odbiorców
    const fetchCategories = async () => {
        try {
            setIsLoadingCategories(true);
            const result = await ExternalRecipientService.getCategories();
            setCategories(result.categories);
        } catch (error) {
            console.error('Błąd podczas pobierania kategorii:', error);
        } finally {
            setIsLoadingCategories(false);
        }
    };

    // Aktualizacja liczników odbiorców
    const updateRecipientCounts = async () => {
        try {
            setIsLoadingCounts(true);

            if (recipientType === 'subscribers' || recipientType === 'mixed') {
                const subscribers = await AdminNewsletterService.getAllSubscribers();
                const filteredSubscribers = subscribers.filter(sub => {
                    if (subscriberFilters.active && !sub.active) return false;
                    if (subscriberFilters.verified && !sub.verified) return false;
                    return !(subscriberFilters.role !== 'all' && sub.role !== subscriberFilters.role);

                });
                setSubscribersCount(filteredSubscribers.length);
            } else {
                setSubscribersCount(0);
            }

            if (recipientType === 'external' || recipientType === 'mixed') {
                if (useSelectedExternalIds && externalRecipientIds.length > 0) {
                    setExternalCount(externalRecipientIds.length);
                } else {
                    const recipients = await ExternalRecipientService.getAllRecipients();
                    const filteredRecipients = recipients.filter(rec => {
                        if (externalFilters.category !== 'all' && rec.category !== externalFilters.category) return false;
                        if (externalFilters.status !== 'all' && rec.status !== externalFilters.status) return false;
                        return !(externalFilters.tags.length > 0 && (!rec.tags || !rec.tags.some(tag => externalFilters.tags.includes(tag))));

                    });
                    setExternalCount(filteredRecipients.length);
                }
            } else {
                setExternalCount(0);
            }
        } catch (error) {
            console.error('Błąd podczas aktualizacji liczby odbiorców:', error);
        } finally {
            setIsLoadingCounts(false);
        }
    };

    // Obsługa wyboru zapisanego szablonu
    const handleSelectSavedTemplate = async (templateId: string | null) => {
        setSelectedSavedTemplateId(templateId);

        if (templateId) {
            try {
                const template = await SavedTemplateService.getTemplateById(templateId);

                if (template) {
                    setSubject(template.subject);
                    setContent(template.content);
                    setUseTemplate(template.useTemplate);
                    setTemplateType(template.templateType as EmailTemplateType);
                } else {
                    toast.error('Nie znaleziono szablonu');
                }
            } catch (error) {
                console.error('Błąd podczas pobierania szablonu:', error);
                toast.error('Nie udało się pobrać szablonu');
            }
        }
    };

    // Obsługa wysyłania emaila
    const handleSendEmail = async () => {
        if (!subject.trim()) {
            toast.error('Podaj temat wiadomości');
            return;
        }

        if (!content.trim()) {
            toast.error('Wpisz treść wiadomości');
            return;
        }

        if ((recipientType === 'external' || recipientType === 'mixed') &&
            !useSelectedExternalIds && externalFilters.category === 'all' &&
            externalFilters.status === 'all' && externalFilters.tags.length === 0) {

            if (!window.confirm('Czy na pewno chcesz wysłać wiadomość do WSZYSTKICH zewnętrznych odbiorców?')) {
                return;
            }
        }

        try {
            setIsSending(true);

            const emailParams: TargetedEmailParams = {
                subject,
                content,
                recipientType,
                useTemplate,
                templateType: useTemplate ? templateType : undefined,
                savedTemplateId: selectedSavedTemplateId || undefined,
                subscriberFilters: recipientType === 'subscribers' || recipientType === 'mixed' ? {
                    role: subscriberFilters.role === 'all' ? undefined : subscriberFilters.role,
                    active: subscriberFilters.active,
                    verified: subscriberFilters.verified
                } : undefined,
                externalFilters: (recipientType === 'external' || recipientType === 'mixed') && !useSelectedExternalIds ? {
                    category: externalFilters.category === 'all' ? undefined : externalFilters.category,
                    status: externalFilters.status === 'all' ? undefined : externalFilters.status,
                    tags: externalFilters.tags.length > 0 ? externalFilters.tags : undefined
                } : undefined,
                externalRecipientIds: (recipientType === 'external' || recipientType === 'mixed') && useSelectedExternalIds ?
                    externalRecipientIds : undefined,
                updateStatus: (recipientType === 'external' || recipientType === 'mixed') && updateStatus,
                newStatus: updateStatus ? newStatus : undefined
            };

            const response = await SendGridService.sendTargetedBulkEmail(emailParams);

            toast.success(response.data.message || `Wiadomość została wysłana do ${response.data.sentCount} odbiorców`);

            // Resetowanie formularza
            setSubject('');
            setContent('');
            setPreviewContent('');
            setSelectedSavedTemplateId(null);
        } catch (error) {
            console.error('Error sending bulk email:', error);
            toast.error('Wystąpił błąd podczas wysyłania wiadomości');
        } finally {
            setIsSending(false);
        }
    };

    // Obsługa zapisywania szablonu
    const handleSaveTemplate = async () => {
        if (!subject.trim()) {
            toast.error('Podaj temat wiadomości przed zapisaniem szablonu');
            return;
        }

        if (!content.trim()) {
            toast.error('Wpisz treść wiadomości przed zapisaniem szablonu');
            return;
        }

        const templateName = prompt('Podaj nazwę dla zapisywanego szablonu:');
        if (!templateName) return;

        try {
            setIsSending(true);

            await SavedTemplateService.saveTemplate({
                name: templateName,
                subject,
                content,
                description: 'Szablon zapisany ' + new Date().toLocaleDateString(),
                useTemplate,
                templateType: useTemplate ? templateType : 'basic'
            });

            toast.success('Szablon został zapisany');
            fetchSavedTemplates().catch(console.error);
        } catch (error) {
            console.error('Error saving template:', error);
            toast.error('Wystąpił błąd podczas zapisywania szablonu');
        } finally {
            setIsSending(false);
        }
    };

    // Generowanie podglądu
    const handlePreview = async () => {
        try {
            if (selectedSavedTemplateId) {
                // Jeśli wybrany zapisany szablon, używamy go jako bazy
                try {
                    const template = await SavedTemplateService.getTemplateById(selectedSavedTemplateId);

                    if (template) {
                        let updatedContent = template.content;
                        if (updatedContent.includes('{{content}}')) {
                            updatedContent = updatedContent.replace('{{content}}', content);
                        } else {
                            // Jeśli nie ma tokenu {{content}}, używamy po prostu aktualnej treści
                            updatedContent = content;
                        }

                        setPreviewContent(updatedContent);
                    } else {
                        toast.error('Nie znaleziono szablonu');
                    }
                } catch (error) {
                    console.error('Błąd podczas pobierania zapisanego szablonu:', error);
                    toast.error('Nie można wygenerować podglądu zapisanego szablonu');
                }
            } else if (useTemplate) {
                try {
                    const preview = await EmailTemplateService.previewTemplate(content, templateType);
                    setPreviewContent(preview);
                } catch (error) {
                    console.error('Błąd podczas pobierania podglądu:', error);
                    toast.error('Nie można wygenerować podglądu. Spróbuj ponownie później.');
                }
            } else {
                setPreviewContent(content);
            }
        } catch (error) {
            console.error('Error generating preview:', error);
            toast.error('Wystąpił błąd podczas generowania podglądu. Spróbuj ponownie później.');
        } finally {
            setIsLoadingPreview(false);
        }
    };

    const isLoading = isLoadingTemplates || isSending || isLoadingSavedTemplates || isLoadingCategories;
    const totalRecipientsCount = subscribersCount + externalCount;

    return (
        <div className="space-y-6">
            <div className="bg-white shadow sm:rounded-lg">
                <div className="p-6">
                    <div className="flex flex-wrap justify-between items-center mb-6">
                        <h3 className="text-lg font-medium text-gray-900">Wyślij wiadomość</h3>

                        <div className="flex items-center gap-2">
                            {isLoadingCounts ? (
                                <div className="flex items-center text-sm text-gray-500">
                                    <LoadingSpinner size="sm"/>
                                    Analizowanie odbiorców...
                                </div>
                            ) : (
                                <div className="text-sm font-medium">
                                    Liczba odbiorców: <span className="text-primary">{totalRecipientsCount}</span>
                                    {recipientType === 'mixed' && (
                                        <span className="text-gray-500 ml-1">
                                            (subskrybenci: {subscribersCount}, zewnętrzni: {externalCount})
                                        </span>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    <Tabs defaultValue="compose" className="w-full">
                        <TabsList className="mb-4">
                            <TabsTrigger value="compose">Treść</TabsTrigger>
                            <TabsTrigger value="recipients">Odbiorcy</TabsTrigger>
                            <TabsTrigger value="templates">Szablony</TabsTrigger>
                            <TabsTrigger value="options" className="flex items-center">
                                <Settings size={14} className="mr-1"/>
                                Opcje
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="compose" className="space-y-4">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Lewa kolumna-edytor */}
                                <div className="space-y-4">
                                    <EmailContentEditor
                                        subject={subject}
                                        content={content}
                                        onSubjectChange={setSubject}
                                        onContentChange={setContent}
                                        isLoading={isLoading}
                                        useTemplate={useTemplate}
                                    />
                                </div>

                                {/* Prawa kolumna-podgląd */}
                                <div className="lg:block">
                                    <EmailPreview
                                        subject={subject}
                                        content={previewContent}
                                        isLoading={isLoadingPreview}
                                    />
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="recipients">
                            <div className="space-y-6">
                                <RecipientTypeSelector
                                    selected={recipientType}
                                    onChange={setRecipientType}
                                    counts={{
                                        subscribers: subscribersCount,
                                        external: externalCount,
                                        total: totalRecipientsCount
                                    }}
                                    isLoading={isLoadingCounts}
                                />

                                {(recipientType === 'subscribers' || recipientType === 'mixed') && (
                                    <SubscriberFilters
                                        filters={subscriberFilters}
                                        onChange={setSubscriberFilters}
                                        isLoading={isLoadingCounts}
                                    />
                                )}

                                {(recipientType === 'external' || recipientType === 'mixed') && (
                                    <ExternalRecipientFilters
                                        filters={externalFilters}
                                        onChange={setExternalFilters}
                                        categories={categories}
                                        isLoading={isLoadingCounts || isLoadingCategories}
                                        useSelectedIds={useSelectedExternalIds}
                                        onToggleSelectedIds={setUseSelectedExternalIds}
                                        selectedIds={externalRecipientIds}
                                        onSelectIds={setExternalRecipientIds}
                                    />
                                )}
                            </div>
                        </TabsContent>

                        <TabsContent value="templates">
                            <div className="space-y-6">
                                {/* Wybór zapisanych szablonów */}
                                <SavedTemplatesSelector
                                    templates={savedTemplates}
                                    selectedId={selectedSavedTemplateId}
                                    onSelect={handleSelectSavedTemplate}
                                    isLoading={isLoadingSavedTemplates}
                                    onRefresh={fetchSavedTemplates}
                                />

                                {/* Wybór systemowego typu szablonu */}
                                <div className="border-t pt-6">
                                    <div className="flex items-center space-x-2 mb-4">
                                        <input
                                            type="checkbox"
                                            id="useTemplate"
                                            checked={useTemplate}
                                            onChange={(e) => setUseTemplate(e.target.checked)}
                                            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                            disabled={isSending}
                                        />
                                        <label htmlFor="useTemplate" className="text-sm font-medium text-gray-700">
                                            Użyj szablonu systemowego
                                        </label>
                                    </div>

                                    {useTemplate && (
                                        <EmailTemplateSelector
                                            templates={availableTemplates}
                                            selectedTemplate={templateType}
                                            onTemplateSelect={setTemplateType}
                                            disabled={isLoading}
                                            isLoading={isLoadingTemplates}
                                        />
                                    )}
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="options">
                            <div className="space-y-6">
                                {/* Opcje aktualizacji statusu */}
                                {(recipientType === 'external' || recipientType === 'mixed') && (
                                    <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                                        <h4 className="font-medium text-gray-900 mb-3">Aktualizacja statusu</h4>
                                        <div className="space-y-4">
                                            <div className="flex items-center">
                                                <input
                                                    type="checkbox"
                                                    id="updateStatus"
                                                    checked={updateStatus}
                                                    onChange={(e) => setUpdateStatus(e.target.checked)}
                                                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                                />
                                                <label htmlFor="updateStatus" className="ml-2 text-sm text-gray-700">
                                                    Automatycznie aktualizuj status odbiorców po wysłaniu wiadomości
                                                </label>
                                            </div>

                                            {updateStatus && (
                                                <div className="ml-6">
                                                    <label className="block text-sm text-gray-700 mb-1">
                                                        Ustaw status na:
                                                    </label>
                                                    <select
                                                        value={newStatus}
                                                        onChange={(e) => setNewStatus(e.target.value as any)}
                                                        className="w-full max-w-xs border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                                                    >
                                                        <option value="contacted">Skontaktowano</option>
                                                        <option value="responded">Odpowiedział</option>
                                                        <option value="subscribed">Zapisany</option>
                                                        <option value="rejected">Odrzucony</option>
                                                    </select>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Opcje zapisywania szablonu */}
                                <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                                    <h4 className="font-medium text-gray-900 mb-3">Zapisywanie szablonu</h4>
                                    <p className="text-sm text-gray-500 mb-3">
                                        Możesz zapisać aktualną wiadomość jako szablon do późniejszego wykorzystania.
                                    </p>
                                    <button
                                        type="button"
                                        onClick={handleSaveTemplate}
                                        className="px-4 py-2 border border-gray-300 rounded shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                                        disabled={isSending || !subject || !content}
                                    >
                                        Zapisz jako szablon
                                    </button>
                                </div>
                            </div>
                        </TabsContent>
                    </Tabs>

                    {/* Przyciski akcji - zawsze widoczne */}
                    <div className="mt-6 flex justify-end space-x-3 pt-4 border-t">
                        <button
                            type="button"
                            onClick={handleSendEmail}
                            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark disabled:opacity-50 flex items-center space-x-2"
                            disabled={isLoading || !subject || !content || totalRecipientsCount === 0}
                        >
                            {isSending ? (
                                <>
                                    <LoadingSpinner size="sm"/>
                                    <span>Wysyłanie...</span>
                                </>
                            ) : (
                                <>
                                    <span>Wyślij wiadomość do {totalRecipientsCount} odbiorców</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BulkEmailSender;