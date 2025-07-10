import React, { useEffect, useState } from "react";
import { Button, Drawer, Form, Input, Popconfirm, Select, Space, Upload, Tag } from "antd";
import MainAreaLayout from "../components/main-layout/main-layout";
import CustomTable from "../components/CustomTable";
import { useMessage } from "../hooks/message";
import { useAppStore, requestClient } from "../store";
import { useMutation, useQuery } from "@tanstack/react-query";
import { InboxOutlined, EyeOutlined, DeleteOutlined, SettingOutlined, LineChartOutlined } from "@ant-design/icons";
import { Modal } from "antd";
import styles from "./style.module.css"
import socket from "../client/socket";
import { useNavigate } from "react-router-dom";
import { record } from "zod";


interface Request {
    key: string;
    id: string;
    title: string;
    description: string;
    pdf: string[];
    status: number;
    createdAt: string;
    docCount: number;
    createdBy: string;
}

const Requests: React.FC = () => {
    const message = useMessage();
    const setAppLoader = useAppStore().setAppLoading;
    const session = useAppStore().session;
    const [form] = Form.useForm();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
    const [requests, setRequests] = useState<Request[]>([]);
    const [fileList, setFileList] = useState<any[]>([]);
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);
    const { Dragger } = Upload;
    const MAX_FILES = 5;

    const navigate = useNavigate();


    // const requestData = useQuery({
    //     queryKey: ["requestData"],
    //     queryFn: async () => {
    //         try {
    //             const response = await requestClient.getAllReq();
    //             const formatted = response.map((item: any) => ({
    //                 id: item.id,
    //                 key: item.id,
    //                 title: item.title,
    //                 description: item.description,
    //                 pdf: item.pdf,
    //                 status: item.reqStatus,
    //                 docCount: item.docCount,
    //                 createdAt: item.createdAt,
    //                 createdBy: item.createdBy,
    //             }));
    //             setRequests(formatted);
    //         } catch (error) {
    //             if (error instanceof Error) {
    //                 message.error(error.message);
    //                 return;
    //             }
    //             if (typeof error === "string") {
    //                 message.error(error);
    //                 return;
    //             }
    //             message.error("Something went wrong");
    //             return;
    //         }
    //     },
    // });

    const requestData = useQuery({
        queryKey: ["requestData"],
        queryFn: async () => {
            try {
                const response = await requestClient.getAllReq();
                const formatted = response.map((item: any) => ({
                    id: item.id,
                    key: item.id,
                    title: item.title,
                    description: item.description,
                    pdf: item.pdf,
                    status: item.reqStatus,
                    docCount: item.docCount,
                    createdAt: item.createdAt,
                    createdBy: item.createdBy,
                }));
                setRequests(formatted);
                return formatted;
            } catch (error) {
                if (error instanceof Error) {
                    message.error(error.message);
                } else if (typeof error === "string") {
                    message.error(error);
                } else {
                    message.error("Something went wrong");
                }

                return [];
            }
        },
    });


    useEffect(() => {
        socket.on("generatedReq", generatedReq);
        socket.on("generatingReq", generatingReqStatus);

        return () => {
            socket.off("generatedReq", generatedReq);
            socket.off("generatingReq", generatingReqStatus);
        }
    }, [])

    const generatedReq = async (reqId: string) => {
        setRequests((prev) => prev.map((item) => item.id === reqId ? { ...item, status: 2 } : item));
        message.success("Request generated successfully!");
    }


    const generatingReqStatus = (payload: any) => {
        if (!payload || typeof payload !== "object") {
            console.warn("Invalid generatingReq payload:", payload);
            return;
        }

        const { reqId, docs } = payload;

        if (!reqId || typeof docs !== "number") {
            console.warn("Missing fields in generatingReq payload:", payload);
            return;
        }

        setRequests((prev) =>
            prev.map((item) =>
                item.id === reqId
                    ? { ...item, status: 1, docCount: item.docCount + docs }
                    : item
            )
        );
    };



    const handlePreviewReq = async (reqId: string) => {
        try {
            const pdfBlob = await requestClient.getReqPreview(reqId);

            const url = URL.createObjectURL(pdfBlob);
            const previewWindow = window.open(url, "_blank");

            if (previewWindow) {
                previewWindow.onload = () => {
                    previewWindow.focus();
                    previewWindow.print();
                };
            } else {
                throw new Error("Unable to open print window");
            }
        } catch (error) {
            message.error("Failed to preview request");
            return;
        }
    }

    const handleGenerateReq = async (reqId: string) => {
        try {
            setRequests((prev) =>
                prev.map((item) =>
                    item.id === reqId
                        ? { ...item, status: 1 }
                        : item
                )
            );
            if (!reqId) {
                console.log("no reqId");
                return;
            }
            await requestClient.generateReq(reqId);
        } catch (error) {
            console.log("error generating req : ", error);
            message.error("Failed to generate request");
            return;
        }
    }

    const handleViewReport = async (reqId: string) => {
        navigate(`/dashboard/report/${reqId}`);
    }

    const handleUpload = (file: File) => {
        const isPdf = file.type === "application/pdf";
        if (!isPdf) {
            message.error("Only PDF files are allowed!");
            return
        }
        if (fileList.length >= MAX_FILES) {
            message.error(`You can only upload up to ${MAX_FILES} files.`);
            return Upload.LIST_IGNORE;
        }
        setFileList((prev) => [...prev, file]);
        return false;
    };

    const handleDeleteReq = useMutation({
        mutationFn: async ({
            requestId,
        }: {
            requestId: string;
        }) => {
            setAppLoader(true);
            await requestClient.deleteReq(requestId);
            return;
        },
        onSuccess: () => {
            requestData.refetch();
            message.success("Request deleted successfully");
        },
        onError: (err) => {
            handleError(err);
        },
        onSettled: () => {
            setAppLoader(false);
        },
    });


    const handleError = (
        error: unknown,
        fallbackMsg = "Something went wrong"
    ) => {
        console.error(error);
        if (error instanceof Error) return message.error(error.message);
        if (typeof error === "string") return message.error(error);
        return message.error(fallbackMsg);
    };

    const handleCreateReq = async () => {
        try {
            const values = await form.validateFields();

            const formData = new FormData();
            formData.append("title", values.title);
            formData.append("description", values.description);

            fileList.forEach((file: any) => {
                formData.append("pdf", file.originFileObj || file);
            });
            await requestClient.createNewReq(formData);
            message.success("Request created successfully!");
            resetFormState();
            requestData.refetch();
            setFileList([]);
        } catch (error: any) {
            console.error("Create request error:", error);
            message.error(error?.message || "Failed to create request");
        }

    };

    const resetFormState = () => {
        setIsModalOpen(false);
        setSelectedRequest(null);
        setTimeout(() => {
            form.resetFields();
        }, 100);
    };

    const columns = [
        {
            title: "Request Name",
            dataIndex: "title",
            key: "title"
        },
        {
            title: "Description",
            dataIndex: "description",
            key: "description"
        },
        {
            title: "Created At",
            dataIndex: "createdAt",
            key: "createdAt",
            render: (createdAt: string) =>
                new Date(createdAt).toLocaleString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true,
                }),
        },
        {
            title: "Documents",
            dataIndex: "docCount",
            key: "docCount",
            render: (text: number, record: Request) => (
                <span
                    style={{ color: "#1677ff", cursor: "pointer" }}
                    onClick={() => navigate(`/dashboard/request/${record.id}`)}
                >
                    {text}
                </span>
            ),
        },
        {
            title: "Status",
            dataIndex: "status",
            key: "status",
            render: (_: any, record: Request) => {
                const status = record.status;

                if (status === 0) {
                    return <Tag color="blue">Draft</Tag>;
                }

                if (status === 1) {
                    return <Tag color="orange">In Progress</Tag>;
                }

                if (status === 2) {
                    return <Tag color="green">Completed</Tag>;
                }

                return;
            }
        },
        {
            title: "Actions",
            key: "actions",
            render: (record: Request) => (
                <Space>
                    <Button onClick={() => handlePreviewReq(record.id)}>
                        <EyeOutlined />
                        Preview
                    </Button>
                    {record.status === 0 && (
                        <Button
                            onClick={() => handleGenerateReq(record.id)}
                        >
                            <SettingOutlined />
                            Generate
                        </Button>
                    )}
                    {record.status === 2 && (
                        <Button
                            onClick={() => handleViewReport(record.id)}>
                            <LineChartOutlined />
                            View Report
                        </Button>
                    )}
                    <Popconfirm
                        title="Delete this user?"
                        onConfirm={async () => {
                            try {
                                await handleDeleteReq.mutateAsync({
                                    requestId: record.id,
                                });
                            } catch (error) {
                                handleError(error);
                            }
                        }}
                    >
                        <Button danger>
                            <DeleteOutlined />
                            Delete
                        </Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <MainAreaLayout
            title={`Requests`}
            extra={
                <Button
                    type="primary"
                    onClick={() => {
                        setIsModalOpen(true);
                        form.resetFields();
                    }}
                >
                    New Request
                </Button>
            }
        >
            <CustomTable
                columns={columns}
                data={requests}
                loading={requestData.isLoading}
                serialNumberConfig={{ name: "", show: true }}
            />
            <Modal
                title="Create Request"
                open={isModalOpen}
                onCancel={() => {
                    setIsModalOpen(false);
                }}
                footer={null}
                centered
                destroyOnClose
            >
                <Form
                    className={styles.form}
                    layout="vertical"
                    form={form}
                    onFinish={handleCreateReq}
                >
                    <Form.Item
                        label="Title"
                        name="title"
                        rules={[
                            { required: true, message: "Title is required" },
                        ]}
                    >
                        <Input placeholder="Enter title" />
                    </Form.Item>

                    <Form.Item
                        label="Description"
                        name="description"
                        normalize={(value) => value?.toLowerCase()}
                        rules={[
                            {
                                required: true,
                                message: "Description is required",
                            },
                        ]}
                    >
                        <Input.TextArea placeholder="Description" rows={2} />
                    </Form.Item>

                    <Form.Item
                        label="PDF File"
                        name="pdf"
                        rules={[
                            {
                                required: true,
                                message: "Upload the pdf file",
                            }
                        ]}
                    >
                        <Dragger
                            name="file"
                            multiple
                            beforeUpload={(file) => {
                                const isPdf = file.type === "application/pdf";
                                if (!isPdf) {
                                    message.error(`${file.name} is not a PDF`);
                                    return Upload.LIST_IGNORE;
                                }

                                if (fileList.length >= MAX_FILES) {
                                    message.error(`You can only upload up to ${MAX_FILES} files.`);
                                    return Upload.LIST_IGNORE;
                                }

                                setFileList((prev) => [...prev, file]);
                                return false;
                            }}
                            fileList={fileList}
                            onChange={({ fileList: newFileList }) => {
                                const validFiles = newFileList.filter(file => {
                                    const isPdf = file.type === "application/pdf";
                                    if (!isPdf) {
                                        message.error(`${file.name} is not a PDF`);
                                        return false;
                                    }
                                    return true;
                                });

                                // Enforce max file count
                                if (validFiles.length > MAX_FILES) {
                                    message.error(`You can only upload up to ${MAX_FILES} files.`);
                                    return;
                                }

                                // Only set valid files
                                setFileList(validFiles);
                            }}
                            onRemove={(file) => {
                                setFileList((prev) => prev.filter((f) => f.uid !== file.uid));
                            }}
                        >
                            <p className="ant-upload-drag-icon">
                                <InboxOutlined style={{ fontSize: 60 }} />
                            </p>
                            <p className="ant-upload-text">Click or drag file to this area to upload</p>
                            <p className="ant-upload-hint">
                                Supports only PDF files (single or bulk upload). Company data or banned files are not allowed.
                            </p>
                        </Dragger>

                    </Form.Item>

                    <Button
                        onClick={() => {
                            setIsModalOpen(false)
                            setFileList([])
                        }}
                        className={styles.formButton}
                    >
                        {"Cancel"}
                    </Button>

                    <Button
                        type="primary"
                        htmlType="submit"
                        className={styles.formButton}
                    >
                        {"Create"}
                    </Button>
                </Form>
            </Modal>

        </MainAreaLayout>
    )
}

export default Requests;