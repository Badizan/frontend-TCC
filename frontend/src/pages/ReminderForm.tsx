import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    Box,
    Button,
    Card,
    CardContent,
    Typography,
    TextField,
    MenuItem,
    Grid,
    Alert,
    Snackbar,
    CircularProgress,
} from '@mui/material';
import { ArrowBack as ArrowBackIcon, Save as SaveIcon } from '@mui/icons-material';
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

interface Reminder {
    id: string;
    vehicleId: string;
    type: string;
    description: string;
    dueDate: string;
    status: string;
    priority: string;
    notes?: string;
}

const reminderTypes = [
    { value: 'MAINTENANCE', label: 'Manutenção' },
    { value: 'INSURANCE', label: 'Seguro' },
    { value: 'LICENSE', label: 'Licenciamento' },
    { value: 'OTHER', label: 'Outros' },
];

const statusOptions = [
    { value: 'PENDING', label: 'Pendente' },
    { value: 'COMPLETED', label: 'Concluído' },
    { value: 'CANCELLED', label: 'Cancelado' },
];

const priorityOptions = [
    { value: 'HIGH', label: 'Alta' },
    { value: 'MEDIUM', label: 'Média' },
    { value: 'LOW', label: 'Baixa' },
];

const ReminderForm: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [formData, setFormData] = useState<Partial<Reminder>>({
        vehicleId: '',
        type: '',
        description: '',
        dueDate: new Date().toISOString(),
        status: 'PENDING',
        priority: 'MEDIUM',
        notes: '',
    });

    useEffect(() => {
        loadVehicles();
        if (id) {
            loadReminder();
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

    const loadReminder = async () => {
        try {
            setLoading(true);
            const response = await api.get<Reminder>(`/reminders/${id}`);
            setFormData(response.data);
        } catch (error) {
            setError('Erro ao carregar lembrete');
            logService.error('Erro ao carregar lembrete', { id, error });
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setLoading(true);
            if (id) {
                await api.put(`/reminders/${id}`, formData);
                logService.info('Lembrete atualizado com sucesso', { id });
            } else {
                await api.post('/reminders', formData);
                logService.info('Lembrete criado com sucesso');
            }
            setSuccess(true);
            setTimeout(() => navigate('/reminders'), 2000);
        } catch (error) {
            setError('Erro ao salvar lembrete');
            logService.error('Erro ao salvar lembrete', { error });
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleDateChange = (date: Date | null) => {
        if (date) {
            setFormData((prev) => ({ ...prev, dueDate: date.toISOString() }));
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ p: 3 }}>
            <Card>
                <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                        <Button
                            startIcon={<ArrowBackIcon />}
                            onClick={() => navigate('/reminders')}
                            sx={{ mr: 2 }}
                        >
                            Voltar
                        </Button>
                        <Typography variant="h5" component="h2">
                            {id ? 'Editar Lembrete' : 'Novo Lembrete'}
                        </Typography>
                    </Box>

                    <form onSubmit={handleSubmit}>
                        <Grid container spacing={3}>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    select
                                    fullWidth
                                    label="Veículo"
                                    name="vehicleId"
                                    value={formData.vehicleId}
                                    onChange={handleChange}
                                    required
                                >
                                    {vehicles.map((vehicle) => (
                                        <MenuItem key={vehicle.id} value={vehicle.id}>
                                            {vehicle.brand} {vehicle.model} - {vehicle.licensePlate}
                                        </MenuItem>
                                    ))}
                                </TextField>
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <TextField
                                    select
                                    fullWidth
                                    label="Tipo"
                                    name="type"
                                    value={formData.type}
                                    onChange={handleChange}
                                    required
                                >
                                    {reminderTypes.map((type) => (
                                        <MenuItem key={type.value} value={type.value}>
                                            {type.label}
                                        </MenuItem>
                                    ))}
                                </TextField>
                            </Grid>

                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Descrição"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    required
                                    multiline
                                    rows={2}
                                />
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
                                    <DatePicker
                                        label="Data de Vencimento"
                                        value={formData.dueDate ? new Date(formData.dueDate) : null}
                                        onChange={handleDateChange}
                                        slotProps={{
                                            textField: {
                                                fullWidth: true,
                                                required: true,
                                            },
                                        }}
                                    />
                                </LocalizationProvider>
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <TextField
                                    select
                                    fullWidth
                                    label="Status"
                                    name="status"
                                    value={formData.status}
                                    onChange={handleChange}
                                    required
                                >
                                    {statusOptions.map((status) => (
                                        <MenuItem key={status.value} value={status.value}>
                                            {status.label}
                                        </MenuItem>
                                    ))}
                                </TextField>
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <TextField
                                    select
                                    fullWidth
                                    label="Prioridade"
                                    name="priority"
                                    value={formData.priority}
                                    onChange={handleChange}
                                    required
                                >
                                    {priorityOptions.map((priority) => (
                                        <MenuItem key={priority.value} value={priority.value}>
                                            {priority.label}
                                        </MenuItem>
                                    ))}
                                </TextField>
                            </Grid>

                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Observações"
                                    name="notes"
                                    value={formData.notes}
                                    onChange={handleChange}
                                    multiline
                                    rows={3}
                                />
                            </Grid>

                            <Grid item xs={12}>
                                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                                    <Button
                                        variant="outlined"
                                        onClick={() => navigate('/reminders')}
                                    >
                                        Cancelar
                                    </Button>
                                    <Button
                                        type="submit"
                                        variant="contained"
                                        color="primary"
                                        startIcon={<SaveIcon />}
                                        disabled={loading}
                                    >
                                        Salvar
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
                    Lembrete salvo com sucesso!
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default ReminderForm; 