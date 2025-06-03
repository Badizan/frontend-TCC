import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Button,
    Card,
    CardContent,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    IconButton,
    Chip,
    TextField,
    InputAdornment,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Alert,
    Snackbar,
} from '@mui/material';
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Search as SearchIcon,
    Notifications as NotificationIcon,
    Build as MaintenanceIcon,
    DirectionsCar as VehicleIcon,
    Warning as WarningIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { api } from '../services/api';
import { logService } from '../services/log.service';

interface Reminder {
    id: string;
    vehicleId: string;
    vehicle: {
        brand: string;
        model: string;
        licensePlate: string;
    };
    type: string;
    description: string;
    dueDate: string;
    status: string;
    priority: string;
    notes?: string;
}

const reminderTypes = [
    { value: 'MAINTENANCE', label: 'Manutenção', icon: <MaintenanceIcon /> },
    { value: 'INSURANCE', label: 'Seguro', icon: <VehicleIcon /> },
    { value: 'LICENSE', label: 'Licenciamento', icon: <WarningIcon /> },
    { value: 'OTHER', label: 'Outros', icon: <NotificationIcon /> },
];

const statusColors = {
    PENDING: 'warning',
    COMPLETED: 'success',
    CANCELLED: 'error',
} as const;

const priorityColors = {
    HIGH: 'error',
    MEDIUM: 'warning',
    LOW: 'info',
} as const;

const ReminderList: React.FC = () => {
    const navigate = useNavigate();
    const [reminders, setReminders] = useState<Reminder[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [reminderToDelete, setReminderToDelete] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        loadReminders();
    }, []);

    const loadReminders = async () => {
        try {
            setLoading(true);
            const response = await api.get<Reminder[]>('/reminders');
            setReminders(response.data);
        } catch (error) {
            setError('Erro ao carregar lembretes');
            logService.error('Erro ao carregar lembretes', { error });
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            setLoading(true);
            await api.delete(`/reminders/${id}`);
            setReminders((prev) => prev.filter((reminder) => reminder.id !== id));
            setSuccess(true);
            logService.info('Lembrete excluído com sucesso', { id });
        } catch (error) {
            setError('Erro ao excluir lembrete');
            logService.error('Erro ao excluir lembrete', { id, error });
        } finally {
            setLoading(false);
            setDeleteDialogOpen(false);
            setReminderToDelete(null);
        }
    };

    const openDeleteDialog = (id: string) => {
        setReminderToDelete(id);
        setDeleteDialogOpen(true);
    };

    const filteredReminders = reminders.filter((reminder) => {
        const searchLower = searchTerm.toLowerCase();
        return (
            reminder.description.toLowerCase().includes(searchLower) ||
            reminder.vehicle.licensePlate.toLowerCase().includes(searchLower) ||
            reminder.vehicle.brand.toLowerCase().includes(searchLower) ||
            reminder.vehicle.model.toLowerCase().includes(searchLower)
        );
    });

    const getReminderTypeIcon = (type: string) => {
        return reminderTypes.find((t) => t.value === type)?.icon || <NotificationIcon />;
    };

    return (
        <Box sx={{ p: 3 }}>
            <Card>
                <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                        <Typography variant="h5" component="h2">
                            Lembretes
                        </Typography>
                        <Button
                            variant="contained"
                            color="primary"
                            startIcon={<AddIcon />}
                            onClick={() => navigate('/reminders/new')}
                        >
                            Novo Lembrete
                        </Button>
                    </Box>

                    <TextField
                        fullWidth
                        variant="outlined"
                        placeholder="Buscar por descrição, placa, marca ou modelo..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        sx={{ mb: 3 }}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon />
                                </InputAdornment>
                            ),
                        }}
                    />

                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Data de Vencimento</TableCell>
                                    <TableCell>Veículo</TableCell>
                                    <TableCell>Tipo</TableCell>
                                    <TableCell>Descrição</TableCell>
                                    <TableCell>Status</TableCell>
                                    <TableCell>Prioridade</TableCell>
                                    <TableCell align="right">Ações</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filteredReminders.map((reminder) => (
                                    <TableRow key={reminder.id}>
                                        <TableCell>
                                            {format(new Date(reminder.dueDate), 'dd/MM/yyyy', { locale: ptBR })}
                                        </TableCell>
                                        <TableCell>
                                            {reminder.vehicle.brand} {reminder.vehicle.model} - {reminder.vehicle.licensePlate}
                                        </TableCell>
                                        <TableCell>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                {getReminderTypeIcon(reminder.type)}
                                                {reminderTypes.find((t) => t.value === reminder.type)?.label}
                                            </Box>
                                        </TableCell>
                                        <TableCell>{reminder.description}</TableCell>
                                        <TableCell>
                                            <Chip
                                                label={reminder.status}
                                                color={statusColors[reminder.status as keyof typeof statusColors]}
                                                size="small"
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={reminder.priority}
                                                color={priorityColors[reminder.priority as keyof typeof priorityColors]}
                                                size="small"
                                            />
                                        </TableCell>
                                        <TableCell align="right">
                                            <IconButton
                                                color="primary"
                                                onClick={() => navigate(`/reminders/${reminder.id}`)}
                                                size="small"
                                            >
                                                <EditIcon />
                                            </IconButton>
                                            <IconButton
                                                color="error"
                                                onClick={() => openDeleteDialog(reminder.id)}
                                                size="small"
                                            >
                                                <DeleteIcon />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </CardContent>
            </Card>

            <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
                <DialogTitle>Confirmar Exclusão</DialogTitle>
                <DialogContent>
                    <Typography>Tem certeza que deseja excluir este lembrete?</Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialogOpen(false)}>Cancelar</Button>
                    <Button
                        onClick={() => reminderToDelete && handleDelete(reminderToDelete)}
                        color="error"
                        variant="contained"
                    >
                        Excluir
                    </Button>
                </DialogActions>
            </Dialog>

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
                    Operação realizada com sucesso!
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default ReminderList; 