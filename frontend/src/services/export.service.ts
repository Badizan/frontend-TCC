import { Expense } from './expense.service';
import { Reminder } from './reminder.service';
import { api } from './api';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import { formatService } from './format.service';

export interface ExportOptions {
    format: 'csv' | 'xlsx' | 'pdf';
    startDate?: string;
    endDate?: string;
    vehicleId?: string;
    type?: 'expenses' | 'reminders' | 'all';
    filename?: string;
    sheetName?: string;
    dateFormat?: string;
    numberFormat?: string;
}

class ExportService {
    async exportData(options: ExportOptions): Promise<Blob> {
        const response = await api.get('/export', {
            params: options,
            responseType: 'blob'
        });
        return response.data;
    }

    async exportExpenses(options: Omit<ExportOptions, 'type'>): Promise<Blob> {
        const response = await api.get('/export/expenses', {
            params: options,
            responseType: 'blob'
        });
        return response.data;
    }

    async exportReminders(options: Omit<ExportOptions, 'type'>): Promise<Blob> {
        const response = await api.get('/export/reminders', {
            params: options,
            responseType: 'blob'
        });
        return response.data;
    }

    async exportVehicle(vehicleId: string, options: Omit<ExportOptions, 'vehicleId' | 'type'>): Promise<Blob> {
        const response = await api.get(`/export/vehicles/${vehicleId}`, {
            params: options,
            responseType: 'blob'
        });
        return response.data;
    }

    async exportToExcel(data: any[], options: ExportOptions = {}): Promise<void> {
        try {
            const worksheet = XLSX.utils.json_to_sheet(this.formatData(data, options));
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, options.sheetName || 'Sheet1');

            const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
            const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

            saveAs(blob, `${options.filename || 'export'}.xlsx`);
        } catch (error) {
            console.error('Error exporting to Excel:', error);
            throw error;
        }
    }

    async exportToCSV(data: any[], options: ExportOptions = {}): Promise<void> {
        try {
            const formattedData = this.formatData(data, options);
            const csvContent = this.convertToCSV(formattedData);
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });

            saveAs(blob, `${options.filename || 'export'}.csv`);
        } catch (error) {
            console.error('Error exporting to CSV:', error);
            throw error;
        }
    }

    async exportToPDF(data: any[], options: ExportOptions = {}): Promise<void> {
        try {
            const formattedData = this.formatData(data, options);
            const pdfContent = await this.generatePDF(formattedData, options);
            const blob = new Blob([pdfContent], { type: 'application/pdf' });

            saveAs(blob, `${options.filename || 'export'}.pdf`);
        } catch (error) {
            console.error('Error exporting to PDF:', error);
            throw error;
        }
    }

    private formatData(data: any[], options: ExportOptions): any[] {
        return data.map(item => {
            const formattedItem: any = {};
            Object.entries(item).forEach(([key, value]) => {
                if (value instanceof Date) {
                    formattedItem[key] = formatService.formatDate(value, options.dateFormat);
                } else if (typeof value === 'number') {
                    formattedItem[key] = formatService.formatCurrency(value);
                } else {
                    formattedItem[key] = value;
                }
            });
            return formattedItem;
        });
    }

    private convertToCSV(data: any[]): string {
        if (data.length === 0) return '';

        const headers = Object.keys(data[0]);
        const csvRows = [
            headers.join(','),
            ...data.map(row => headers.map(header => {
                const value = row[header];
                return typeof value === 'string' && value.includes(',')
                    ? `"${value}"`
                    : value;
            }).join(','))
        ];

        return csvRows.join('\n');
    }

    private async generatePDF(data: any[], options: ExportOptions): Promise<Uint8Array> {
        // Implementação do PDF usando uma biblioteca como jsPDF
        // Este é um exemplo simplificado
        const { jsPDF } = await import('jspdf');
        const doc = new jsPDF();

        const headers = Object.keys(data[0]);
        const rows = data.map(item => Object.values(item));

        doc.autoTable({
            head: [headers],
            body: rows,
        });

        return doc.output('arraybuffer');
    }

    exportExpenses: (expenses: Expense[]) => {
        const formattedExpenses = expenses.map(expense => ({
        ID: expense.id,
        Veículo: expense.vehicleId,
        Tipo: expense.type,
        Descrição: expense.description,
        Data: new Date(expense.date).toLocaleDateString(),
        Valor: expense.amount.toFixed(2),
        Quilometragem: expense.mileage,
        Observações: expense.notes || ''
    }));

        exportService.exportToCSV(formattedExpenses, { filename: 'despesas' });
},

exportReminders: (reminders: Reminder[]) => {
    const formattedReminders = reminders.map(reminder => ({
        ID: reminder.id,
        Veículo: reminder.vehicleId,
        Tipo: reminder.type,
        Descrição: reminder.description,
        'Data de Vencimento': new Date(reminder.dueDate).toLocaleDateString(),
        Status: reminder.status,
        Prioridade: reminder.priority,
        Observações: reminder.notes || ''
    }));

    exportService.exportToCSV(formattedReminders, { filename: 'lembretes' });
}
}

export const exportService = new ExportService(); 