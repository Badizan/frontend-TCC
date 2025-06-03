import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    Box,
    Button,
    Card,
    CardContent,
    Grid,
    TextField,
    Typography,
    MenuItem,
    FormControl,
    InputLabel,
    Select,
    Alert,
    Snackbar,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ptBR } from 'date-fns/locale';
import { api } from '../services/api';
import { logService } from '../services/log.service';

interface Vehicle {
    id: string;
    brand: string;
    model: string;
    licensePlate: string;
}

interface Expense {
    id?: string;
    vehicleId: string;
    type: string;
    description: string;
    amount: number;
    date: Date | null;
    status: string;
    paymentMethod: string;
    notes?: string;
}

const expenseTypes = [
    { value: 'FUEL', label: 'Combustível' },
    { value: 'MAINTENANCE', label: 'Manutenção' },
    { value: 'INSURANCE', label: 'Seguro' },
    { value: 'OTHER', label: 'Outros' },
];

const statuses = ['PENDING', 'PAID', 'CANCELLED'];
const paymentMethods = ['Dinheiro', 'Cartão de Crédito', 'Cartão de Débito', 'PIX', 'Transferência'];

const ExpenseForm: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [expense, setExpense] = useState<Expense>({
        vehicleId: '',
        type: expenseTypes[0].value,
        description: '',
        amount: 0,
        date: new Date(),
        status: statuses[0],
        paymentMethod: paymentMethods[0],
        notes: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        loadVehicles();
        if (id) {
            loadExpense();
        }
    }, [id]);

    const loadVehicles = async () => {
        try {
            const response = await api.get<Vehicle[]>('/vehicles');
            setVehicles(response.data);
        } catch (error) {
            setError('Erro ao carregar veículos');
            logService.error('Erro ao carregar veículos', { error });
        }
    };

    const loadExpense = async () => {
        try {
            setLoading(true);
            const response = await api.get<Expense>(`/expenses/${id}`);
            const expenseData = response.data;
            setExpense({
                ...expenseData,
                date: expenseData.date ? new Date(expenseData.date) : null,
            });
        } catch (error) {
            setError('Erro ao carregar dados da despesa');
            logService.error('Erro ao carregar despesa', { id, error });
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (event: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
        const { name, value } = event.target;
        setExpense((prev) => ({
            ...prev,
            [name as string]: value,
        }));
    };

    const handleDateChange = (value: Date | null) => {
        setExpense((prev) => ({
            ...prev,
            date: value,
        }));
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        try {
            setLoading(true);
            setError(null);

            if (id) {
                await api.put(`/expenses/${id}`, expense);
                logService.info('Despesa atualizada com sucesso', { id });
            } else {
                await api.post('/expenses', expense);
                logService.info('Despesa criada com sucesso', { expense });
            }

            setSuccess(true);
            setTimeout(() => {
                navigate('/expenses');
            }, 2000);
        } catch (error) {
            setError('Erro ao salvar despesa');
            logService.error('Erro ao salvar despesa', { expense, error });
        } finally {
            setLoading(false);
        }
    };

    return (
        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
            <Box sx={{ p: 3 }}>
                <Card>
                    <CardContent>
                        <Typography variant="h5" component="h2" gutterBottom>
                            {id ? 'Editar Despesa' : 'Nova Despesa'}
                        </Typography>

                        <form onSubmit={handleSubmit}>
                            <Grid container spacing={3}>
                                <Grid item xs={12} sm={6}>
                                    <FormControl fullWidth required>
                                        <InputLabel>Veículo</InputLabel>
                                        <Select
                                            name="vehicleId"
                                            value={expense.vehicleId}
                                            onChange={handleChange}
                                            label="Veículo"
                                        >
                                            {vehicles.map((vehicle) => (
                                                <MenuItem key={vehicle.id} value={vehicle.id}>
                                                    {vehicle.brand} {vehicle.model} - {vehicle.licensePlate}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <FormControl fullWidth required>
                                        <InputLabel>Tipo</InputLabel>
                                        <Select
                                            name="type"
                                            value={expense.type}
                                            onChange={handleChange}
                                            label="Tipo"
                                        >
                                            {expenseTypes.map((type) => (
                                                <MenuItem key={type.value} value={type.value}>
                                                    {type.label}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        label="Descrição"
                                        name="description"
                                        value={expense.description}
                                        onChange={handleChange}
                                        required
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label="Valor"
                                        name="amount"
                                        type="number"
                                        value={expense.amount}
                                        onChange={handleChange}
                                        required
                                        InputProps={{
                                            startAdornment: 'R$ ',
                                        }}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <DatePicker
                                        label="Data"
                                        value={expense.date}
                                        onChange={handleDateChange}
                                        slotProps={{ textField: { fullWidth: true, required: true } }}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <FormControl fullWidth required>
                                        <InputLabel>Status</InputLabel>
                                        <Select
                                            name="status"
                                            value={expense.status}
                                            onChange={handleChange}
                                            label="Status"
                                        >
                                            {statuses.map((status) => (
                                                <MenuItem key={status} value={status}>
                                                    {status}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <FormControl fullWidth required>
                                        <InputLabel>Forma de Pagamento</InputLabel>
                                        <Select
                                            name="paymentMethod"
                                            value={expense.paymentMethod}
                                            onChange={handleChange}
                                            label="Forma de Pagamento"
                                        >
                                            {paymentMethods.map((method) => (
                                                <MenuItem key={method} value={method}>
                                                    {method}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        label="Observações"
                                        name="notes"
                                        value={expense.notes}
                                        onChange={handleChange}
                                        multiline
                                        rows={4}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                                        <Button
                                            variant="outlined"
                                            onClick={() => navigate('/expenses')}
                                            disabled={loading}
                                        >
                                            Cancelar
                                        </Button>
                                        <Button
                                            type="submit"
                                            variant="contained"
                                            color="primary"
                                            disabled={loading}
                                        >
                                            {loading ? 'Salvando...' : 'Salvar'}
                                        </Button>
                                    </Box>
                                </Grid>
                            </Grid>
                        </form>
                    </CardContent>
                </Card>

                <Snackbar
                    open={!!error}
                    autoHideDuration={6000}
                    onClose={() => setError(null)}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                >
                    <Alert severity="error" onClose={() => setError(null)}>
                        {error}
                    </Alert>
                </Snackbar>

                <Snackbar
                    open={success}
                    autoHideDuration={2000}
                    onClose={() => setSuccess(false)}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                >
                    <Alert severity="success" onClose={() => setSuccess(false)}>
                        Despesa salva com sucesso!
                    </Alert>
                </Snackbar>
            </Box>
        </LocalizationProvider>
    );
};

export default ExpenseForm; 