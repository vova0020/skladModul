'use client';

/* eslint-disable */
// @ts-nocheck
// @ts-ignore
import React, { useEffect, useState } from 'react';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { useForm, SubmitHandler } from 'react-hook-form';
import axios from 'axios';
import { Alert } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

import Navbar from '@/app/components/navbar';



const theme = createTheme();

type RegisterFormInputs = {
    firstName: string;  // Имя
    lastName: string;   // Фамилия
    login: string;
    password: string;
    confirmPassword: string;
    role: number;
   
};
 {/* @ts-ignore */}
const Register: React.FC = ({closeModal}) => {

    // const roles = ['Руководство', 'Мастер', 'Пользователь'];
    const [roles, setRoles] = useState([]);
    const [sectors, setSectors] = useState([]);
    const [stanocks, setStanocks] = useState([]);


    useEffect(() => {
        getData();
    }, []);

    const getData = async () => {
        try {
            const response = await axios.get('/api/adminka/getRole');
            // @ts-ignore
            setRoles(response.data.sort((a, b) => a.id - b.id));


        } catch (error) {
            // showSnackbar('Ошибка загрузки данных.', 'error');
        }
    };

    const { register, handleSubmit, formState: { errors }, watch, setValue, clearErrors, reset } = useForm<RegisterFormInputs>();


    // Следим за значением поля "Роль"
    const selectedRole = watch('role');


    const [notification, setNotification] = useState<{ message: string; severity: "success" | "error" } | null>(null);

    const onSubmit: SubmitHandler<RegisterFormInputs> = async (data) => {
        console.log(data);
        
        try {
            await axios.post('/api/adminka/register', data);
            setNotification({ message: "Пользователь успешно зарегистрирован", severity: "success" });
            // setRoles([])
            // setSectors([])
            // Очищаем поля формы после успешной регистрации
            reset();
            // reset({
            //     role: 0,   // Сбрасываем значение роли
            //     sector: 0, // Сбрасываем значение сектора
            // });
            getData()
            // window.location.reload();
            closeModal()
        } catch (error: any) {
            console.error("Ошибка при регистрации:", error);
            if (error.response && error.response.status === 409) {
                setNotification({ message: "Пользователь с таким логином уже существует", severity: "error" });
            } else {
                setNotification({ message: "Произошла ошибка при регистрации пользователя", severity: "error" });
            }
        }
    };



    const password = watch("password");




    return (
        <div style={{backgroundColor: '#fff', width:'70%', height:'95%', borderRadius:'30px', padding:'10px',    overflow: 'auto', // Добавляет прокрутку, если содержимое превышает размеры
            boxSizing: 'border-box'}}>
            <ArrowBackIcon fontSize='large' onClick={closeModal}/>
           
                <ThemeProvider theme={theme} >
                    <Container component="main" maxWidth="xs" >
                        <CssBaseline />
                        <Box
                            sx={{

                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                
                            }}
                        >
                            <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
                                <PersonAddIcon />
                            </Avatar>
                            <Typography component="h1" variant="h5">
                                Регистрация нового пользователя
                            </Typography>
                            {/* Показываем уведомление, если оно есть */}
                            {notification && (
                                <Alert severity={notification.severity} sx={{ mt: 2 }}>
                                    {notification.message}
                                </Alert>
                            )}
                            <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate sx={{ mt: 1 }}>
                                <TextField
                                    margin="normal"
                                    required
                                    fullWidth
                                    id="firstName"
                                    label="Имя"
                                    autoComplete="firstName"
                                    autoFocus
                                    {...register("firstName", { required: "Укажите имя" })}
                                    error={!!errors.firstName}
                                    helperText={errors.firstName?.message}
                                />
                                <TextField
                                    margin="normal"
                                    required
                                    fullWidth
                                    id="lastName"
                                    label="Фамилия"
                                    autoComplete="lastName"
                                    {...register("lastName", { required: "Укажите фамилию" })}
                                    error={!!errors.lastName}
                                    helperText={errors.lastName?.message}
                                />
                                <TextField
                                    margin="normal"
                                    required
                                    fullWidth
                                    id="login"
                                    label="Логин"
                                    autoComplete="login"
                                    autoFocus
                                    {...register("login", { required: "Укажите логин" })}
                                    error={!!errors.login}
                                    helperText={errors.login?.message}
                                />

                                <TextField
                                    margin="normal"
                                    required
                                    fullWidth
                                    label="Пароль"
                                    type="password"
                                    id="password"
                                    autoComplete="new-password"
                                    {...register("password", { required: "Требуется ввести пароль", minLength: { value: 6, message: "Длина пароля должна составлять не менее 6 символов" } })}
                                    error={!!errors.password}
                                    helperText={errors.password?.message}
                                />
                                <TextField
                                    margin="normal"
                                    required
                                    fullWidth
                                    label="Подтвердите пароль"
                                    type="password"
                                    id="confirmPassword"
                                    autoComplete="new-password"
                                    {...register("confirmPassword", {
                                        required: "Пожалуйста, подтвердите свой пароль",
                                        validate: (value) => value === password || "Пароли не совпадают"
                                    })}
                                    error={!!errors.confirmPassword}
                                    helperText={errors.confirmPassword?.message}
                                />

                                {/* Выпадающий список для роли */}
                                <TextField
                                    select
                                    margin="normal"
                                    required
                                    fullWidth
                                    id="role"
                                    label="Роль"
                                    {...register("role", { required: "Выберите роль" })}
                                    error={!!errors.role}
                                    helperText={errors.role?.message}
                                >
                                    {roles.map((role) => (
                                        // @ts-ignore
                                        <MenuItem key={role.id} value={role.id || ''}>
                                             {/* @ts-ignore */}
                                            {role.name}
                                        </MenuItem>
                                    ))}
                                </TextField>

                               


                                <Button
                                    type="submit"
                                    fullWidth
                                    variant="contained"
                                    sx={{ mt: 3, mb: 2 }}
                                >
                                    Зарегистрироваться
                                </Button>
                                <Grid container>
                                    <Grid item xs>
                                        {/* Возможно, сюда можно добавить ссылку на страницу авторизации */}
                                    </Grid>
                                </Grid>
                            </Box>
                        </Box>
                    </Container>
                </ThemeProvider>
            
        </div>

    );
}
export default Register; // Без ограничения по ролям
