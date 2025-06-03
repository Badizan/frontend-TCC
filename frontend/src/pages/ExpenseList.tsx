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
    AttachMoney as MoneyIcon,
    LocalGasStation as FuelIcon,
    Build as MaintenanceIcon,
    DirectionsCar as VehicleIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { api } from '../services/api';
import { logService } from '../services/log.service';

interface Expense {
    id: string;
    vehicleId: string;
    vehicle: {
        brand: string;
        model: string;
        licensePlate: string;
    };
    type: string;
    description: string;
    amount: number;
    date: string;
    status: string;
    paymentMethod: string;
    notes?: string;
}

const expenseTypes = [
    { value: 'FUEL', label: 'Combustível', icon: <FuelIcon /> },
    { value: 'MAINTENANCE', label: 'Manutenção', icon: <MaintenanceIcon /> },
    { value: 'INSURANCE', label: 'Seguro', icon: <VehicleIcon /> },
    { value: 'OTHER', label: 'Outros', icon: <MoneyIcon /> },
];

const statusColors = {
    PENDING: 'warning',
    PAID: 'success',
    CANCELLED: 'error',
} as const;

const paymentMethods = ['Dinheiro', 'Cartão de Crédito', 'Cartão de Débito', 'PIX', 'Transferência'];

const ExpenseList: React.FC = () => {
    const navigate = useNavigate();
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [expenseToDelete, setExpenseToDelete] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        loadExpenses();
    }, []);

    const loadExpenses = async () => {
        try {
            setLoading(true);
            const response = await api.get<Expense[]>('/expenses');
            setExpenses(response.data);
        } catch (error) {
            setError('Erro ao carregar despesas');
            logService.error('Erro ao carregar despesas', { error });
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            setLoading(true);
            await api.delete(`/expenses/${id}`);
            setExpenses((prev) => prev.filter((expense) => expense.id !== id));
            setSuccess(true);
            logService.info('Despesa excluída com sucesso', { id });
        } catch (error) {
            setError('Erro ao excluir despesa');
            logService.error('Erro ao excluir despesa', { id, error });
        } finally {
            setLoading(false);
            setDeleteDialogOpen(false);
            setExpenseToDelete(null);
        }
    };

    const openDeleteDialog = (id: string) => {
        setExpenseToDelete(id);
        setDeleteDialogOpen(true);
    };

    const filteredExpenses = expenses.filter((expense) => {
        const searchLower = searchTerm.toLowerCase();
        return (
            expense.description.toLowerCase().includes(searchLower) ||
            expense.vehicle.licensePlate.toLowerCase().includes(searchLower) ||
            expense.vehicle.brand.toLowerCase().includes(searchLower) ||
            expense.vehicle.model.toLowerCase().includes(searchLower)
        );
    });

    const getExpenseTypeIcon = (type: string) => {
        return expenseTypes.find((t) => t.value === type)?.icon || <MoneyIcon />;
    };

    return (
        <Box sx={{ p: 3 }}>
            <Card>
                <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                        <Typography variant="h5" component="h2">
                            Despesas
                        </Typography>
                        <Button
                            variant="contained"
                            color="primary"
                            startIcon={<AddIcon />}
                            onClick={() => navigate('/expenses/new')}
                        >
                            Nova Despesa
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
                                    <TableCell>Data</TableCell>
                                    <TableCell>Veículo</TableCell>
                                    <TableCell>Tipo</TableCell>
                                    <TableCell>Descrição</TableCell>
                                    <TableCell>Valor</TableCell>
                                    <TableCell>Status</TableCell>
                                    <TableCell>Forma de Pagamento</TableCell>
                                    <TableCell align="right">Ações</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filteredExpenses.map((expense) => (
                                    <TableRow key={expense.id}>
                                        <TableCell>
                                            {format(new Date(expense.date), 'dd/MM/yyyy', { locale: ptBR })}
                                        </TableCell>
                                        <TableCell>
                                            {expense.vehicle.brand} {expense.vehicle.model} - {expense.vehicle.licensePlate}
                                        </TableCell>
                                        <TableCell>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                {getExpenseTypeIcon(expense.type)}
                                                {expenseTypes.find((t) => t.value === expense.type)?.label}
                                            </Box>
                                        </TableCell>
                                        <TableCell>{expense.description}</TableCell>
                                        <TableCell>
                                            {new Intl.NumberFormat('pt-BR', {
                                                style: 'currency',
                                                currency: 'BRL',
                                            }).format(expense.amount)}
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={expense.status}
                                                color={statusColors[expense.status as keyof typeof statusColors]}
                                                size="small"
                                            />
                                        </TableCell>
                                        <TableCell>{expense.paymentMethod}</TableCell>
                                        <TableCell align="right">
                                            <IconButton
                                                color="primary"
                                                onClick={() => navigate(`/expenses/${expense.id}`)}
                                                size="small"
                                            >
                                                <EditIcon />
                                            </IconButton>
                                            <IconButton
                                                color="error"
                                                onClick={() => openDeleteDialog(expense.id)}
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
                    <Typography>Tem certeza que deseja excluir esta despesa?</Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialogOpen(false)}>Cancelar</Button>
                    <Button
                        onClick={() => expenseToDelete && handleDelete(expenseToDelete)}
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

export default ExpenseList; 