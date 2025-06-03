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
    id?: string;
    brand: string;
    model: string;
    year: number;
    color: string;
    licensePlate: string;
    chassis: string;
    fuelType: string;
    transmission: string;
    mileage: number;
    lastMaintenance: Date | null;
    nextMaintenance: Date | null;
    status: string;
    notes?: string;
}

const fuelTypes = ['Gasolina', 'Etanol', 'Diesel', 'GNV', 'Híbrido', 'Elétrico'];
const transmissions = ['Manual', 'Automático', 'CVT', 'Semi-automático'];
const statuses = ['Ativo', 'Em Manutenção', 'Inativo', 'Vendido'];

const VehicleForm: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const [vehicle, setVehicle] = useState<Vehicle>({
        brand: '',
        model: '',
        year: new Date().getFullYear(),
        color: '',
        licensePlate: '',
        chassis: '',
        fuelType: fuelTypes[0],
        transmission: transmissions[0],
        mileage: 0,
        lastMaintenance: null,
        nextMaintenance: null,
        status: statuses[0],
        notes: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (id) {
            loadVehicle();
        }
    }, [id]);

    const loadVehicle = async () => {
        try {
            setLoading(true);
            const response = await api.get<Vehicle>(`/vehicles/${id}`);
            const vehicleData = response.data;
            setVehicle({
                ...vehicleData,
                lastMaintenance: vehicleData.lastMaintenance ? new Date(vehicleData.lastMaintenance) : null,
                nextMaintenance: vehicleData.nextMaintenance ? new Date(vehicleData.nextMaintenance) : null,
            });
        } catch (error) {
            setError('Erro ao carregar dados do veículo');
            logService.error('Erro ao carregar veículo', { id, error });
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (event: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
        const { name, value } = event.target;
        setVehicle((prev) => ({
            ...prev,
            [name as string]: value,
        }));
    };

    const handleDateChange = (field: 'lastMaintenance' | 'nextMaintenance', value: Date | null) => {
        setVehicle((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        try {
            setLoading(true);
            setError(null);

            if (id) {
                await api.put(`/vehicles/${id}`, vehicle);
                logService.info('Veículo atualizado com sucesso', { id });
            } else {
                await api.post('/vehicles', vehicle);
                logService.info('Veículo criado com sucesso', { vehicle });
            }

            setSuccess(true);
            setTimeout(() => {
                navigate('/vehicles');
            }, 2000);
        } catch (error) {
            setError('Erro ao salvar veículo');
            logService.error('Erro ao salvar veículo', { vehicle, error });
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
                            {id ? 'Editar Veículo' : 'Novo Veículo'}
                        </Typography>

                        <form onSubmit={handleSubmit}>
                            <Grid container spacing={3}>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label="Marca"
                                        name="brand"
                                        value={vehicle.brand}
                                        onChange={handleChange}
                                        required
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label="Modelo"
                                        name="model"
                                        value={vehicle.model}
                                        onChange={handleChange}
                                        required
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label="Ano"
                                        name="year"
                                        type="number"
                                        value={vehicle.year}
                                        onChange={handleChange}
                                        required
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label="Cor"
                                        name="color"
                                        value={vehicle.color}
                                        onChange={handleChange}
                                        required
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label="Placa"
                                        name="licensePlate"
                                        value={vehicle.licensePlate}
                                        onChange={handleChange}
                                        required
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label="Chassi"
                                        name="chassis"
                                        value={vehicle.chassis}
                                        onChange={handleChange}
                                        required
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <FormControl fullWidth>
                                        <InputLabel>Tipo de Combustível</InputLabel>
                                        <Select
                                            name="fuelType"
                                            value={vehicle.fuelType}
                                            onChange={handleChange}
                                            label="Tipo de Combustível"
                                            required
                                        >
                                            {fuelTypes.map((type) => (
                                                <MenuItem key={type} value={type}>
                                                    {type}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <FormControl fullWidth>
                                        <InputLabel>Transmissão</InputLabel>
                                        <Select
                                            name="transmission"
                                            value={vehicle.transmission}
                                            onChange={handleChange}
                                            label="Transmissão"
                                            required
                                        >
                                            {transmissions.map((type) => (
                                                <MenuItem key={type} value={type}>
                                                    {type}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label="Quilometragem"
                                        name="mileage"
                                        type="number"
                                        value={vehicle.mileage}
                                        onChange={handleChange}
                                        required
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <FormControl fullWidth>
                                        <InputLabel>Status</InputLabel>
                                        <Select
                                            name="status"
                                            value={vehicle.status}
                                            onChange={handleChange}
                                            label="Status"
                                            required
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
                                    <DatePicker
                                        label="Última Manutenção"
                                        value={vehicle.lastMaintenance}
                                        onChange={(date) => handleDateChange('lastMaintenance', date)}
                                        slotProps={{ textField: { fullWidth: true } }}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <DatePicker
                                        label="Próxima Manutenção"
                                        value={vehicle.nextMaintenance}
                                        onChange={(date) => handleDateChange('nextMaintenance', date)}
                                        slotProps={{ textField: { fullWidth: true } }}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        label="Observações"
                                        name="notes"
                                        value={vehicle.notes}
                                        onChange={handleChange}
                                        multiline
                                        rows={4}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                                        <Button
                                            variant="outlined"
                                            onClick={() => navigate('/vehicles')}
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
                        Veículo salvo com sucesso!
                    </Alert>
                </Snackbar>
            </Box>
        </LocalizationProvider>
    );
};

export default VehicleForm; 