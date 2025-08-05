export interface Contract {
    id: string;
    name: string;
    type: 'standard' | 'credit' | 'corporate';
    template: string;
    fields: ContractField[];
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    createdBy: string;
}

export interface ContractField {
    id: string;
    name: string;
    type: 'text' | 'number' | 'date' | 'select' | 'textarea';
    label: string;
    required: boolean;
    placeholder?: string;
    options?: string[];
    validation?: string;
    defaultValue?: any;
}

export interface GeneratedContract {
    id: string;
    templateId: string;
    clientData: any;
    generatedContent: string;
    pdfUrl?: string;
    createdAt: Date;
    createdBy: string;
    status: 'draft' | 'generated' | 'signed';
}

export interface ContractTemplate {
    id: string;
    name: string;
    type: string;
    content: string;
    fields: ContractField[];
    isActive: boolean;
}
