import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button, Form, Grid, Input, Typography, notification } from "antd";
import { LockOutlined, MailOutlined, UserOutlined } from "@ant-design/icons";
import { fn_signUpUserApi } from "../../api/api";
import Cookies from "js-cookie";

const { useBreakpoint } = Grid;
const { Text, Title } = Typography;

const MerchantSignUp = ({ authorization, setAuthorization }) => {
    const navigate = useNavigate();
    const screens = useBreakpoint();

    const [searchParams] = useSearchParams();
    const email = searchParams.get("email");
    const password = searchParams.get("password");

    const [loginLoader, setLoginLoader] = useState(false);
    const [emailInput, setEmailInput] = useState("");
    const [nameInput, setNameInput] = useState("");
    const [passwordInput, setPasswordInput] = useState("");

    useEffect(() => {
        if (authorization) {
            navigate("/");
        }
    }, []);

    useEffect(() => {
        if (nameInput && email && password) {
            const values = { name: nameInput, email: email, password: password };
            onFinish(values)
        }
    }, []);

    const onFinish = async (values) => {
        try {
            setLoginLoader(true);
            const response = await fn_signUpUserApi(values);
            console.log("l=ogi==nn response ===> ", response);
            if (response?.status) {
                // Store userId in cookies if available
                if (response?.data?.data?._id) {
                    Cookies.set("userId", response.data.data._id);
                }
                notification.success({
                    message: "Sign Up Successful",
                    description: "You are successfully signed up.",
                    placement: "topRight",
                });
                setAuthorization(true);
                navigate("/");
            } else {
                setLoginLoader(false);
                notification.error({
                    message: "Sign up Failed",
                    description: response?.message || "Please try again.",
                    placement: "topRight",
                });
            }
        } catch (error) {
            console.error("Sign up error: ", error);
            setLoginLoader(false);
            notification.error({
                message: "Error",
                description: "An unexpected error occurred. Please try again later.",
                placement: "topRight",
            });
        }
    };

    const styles = {
        container: {
            margin: "0 auto",
            padding: screens.md ? "40px" : "30px 15px",
            width: "380px",
            backgroundColor: "#fff",
            borderRadius: "8px",
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
        },
        footer: {
            marginTop: "20px",
            textAlign: "center",
            width: "100%",
        },
        forgotPassword: {
            float: "right",
        },
        header: {
            marginBottom: "30px",
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
        },
        section: {
            alignItems: "center",
            backgroundColor: "#f5f5f5",
            display: "flex",
            height: screens.sm ? "100vh" : "auto",
            padding: "40px 0",
        },
        text: {
            color: "#6c757d",
        },
        title: {
            fontSize: screens.md ? "24px" : "20px",
            marginTop: "10px",
        },
        logo: {
            width: "80px",
            height: "auto",
        },
        checkboxGroup: {
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "20px",
        },
        checkbox: {
            marginLeft: "20px",
        },
    };

    return (
        <section style={styles.section}>
            <div style={styles.container}>
                <div style={styles.header}>
                    {/* <img src={logo} alt="Logo" style={styles.logo} /> */}
                    <Title level={2} style={styles.title}>
                        User Sign Up
                    </Title>
                    <Text style={styles.text}>
                        Welcome! Please enter your details below to sign up as a user.
                    </Text>
                </div>
                <Form
                    name="normal_login"
                    className="login-form"
                    initialValues={{
                        remember: true,
                    }}
                    onFinish={onFinish}
                >
                    <div style={{ marginBottom: 16, textAlign: "center" }}>
                        <span>
                            Already have an account?{" "}
                            <span
                                style={{ color: "#1890ff", cursor: "pointer", fontWeight: 500 }}
                                onClick={() => navigate("/Merchant-Login")}
                            >
                                Login
                            </span>
                        </span>
                    </div>

                    <Form.Item
                        name="name"
                        rules={[
                            {
                                required: true,
                                message: "Please enter your name!",
                            },
                        ]}
                    >
                        <Input
                            prefix={<UserOutlined className="site-form-item-icon" />}
                            placeholder="Name"
                            value={nameInput}
                            onChange={(e) => setNameInput(e.target.value)}
                        />
                    </Form.Item>

                    <Form.Item
                        name="email"
                        rules={[
                            {
                                required: true,
                                message: "Please input your Email!",
                            },
                        ]}
                    >
                        <Input
                            prefix={<MailOutlined className="site-form-item-icon" />}
                            placeholder="Email"
                            value={emailInput}
                            onChange={(e) => setEmailInput(e.target.value)}
                        />
                    </Form.Item>

                    <Form.Item
                        name="password"
                        rules={[
                            {
                                required: true,
                                message: "Please input your Password!",
                            },
                        ]}
                    >
                        <Input.Password
                            prefix={<LockOutlined className="site-form-item-icon" />}
                            type="password"
                            placeholder="Password"
                            value={passwordInput}
                            onChange={(e) => setPasswordInput(e.target.value)}
                        />
                    </Form.Item>

                    <Form.Item>
                        <Button
                            type="primary"
                            htmlType="submit"
                            className="login-form-button w-full"
                            loading={loginLoader}
                        >
                            Sign Up
                        </Button>
                    </Form.Item>
                </Form>
            </div>
        </section>
    );
};

export default MerchantSignUp;
