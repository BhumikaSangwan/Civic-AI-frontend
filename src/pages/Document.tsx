import React from "react";
import { useState, useEffect } from "react";
import { useParams } from "react-router";
import MainAreaLayout from "../components/main-layout/main-layout";
import { requestClient } from "../store";
import { Descriptions, Tag, Card, Typography, Button } from "antd";

interface BasicDetails {
    name: string;
    mobileNumber?: string;
    ward?: string;
}

interface Problems {
    category: string[];
    description: {
        english: string;
        hindi: string;
    };
}

const Document: React.FC = () => {
    const { id, docId } = useParams<{ id: string, docId: string }>();
    const [name, setName] = useState<string>("");
    const [basicDetails, setBasicDetails] = useState<BasicDetails>({
        name: "",
        mobileNumber: "",
        ward: ""
    });
    const [problems, setProblems] = useState<Problems[]>([]);


    useEffect(() => {
        if (id && docId) {
            fetchDocumentDetails();
        }
    }, [id, docId]);

    const fetchDocumentDetails = async () => {
        try {
            if (!id || !docId) return;
            const response = await requestClient.getDocumentDetails({ id, docId });
            console.log("Document response:", response);
            const shownName = response.name.includes("(")
                ? response.name.split("(")[0].trim()  // Get part before "(" and trim spaces
                : response.name;
            setName(shownName);
            const formattedBasicDetails: BasicDetails = {
                name: response.name,
                mobileNumber: response.phoneNumber || "",
                ward: response.ward || "N/A"
            }
            setBasicDetails(formattedBasicDetails);

            const formattedProblems = response.problems.map((problem: any) => ({
                category: problem.category,
                description: {
                    english: problem.description.english,
                    hindi: problem.description.hindi
                }
            }));
            setProblems(formattedProblems);
        } catch (error) {
            console.error("Error fetching document details:", error);
        }
    };

    const handleDownloadDoc = async () => {
        try {
            if (!id || !docId) return;
            const blob = await requestClient.downloadDocImage({ id, docId });

            const url = window.URL.createObjectURL(new Blob([blob]));
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute('download', `document-${docId}.jpeg`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);

        } catch (error) {
            console.error("Error downloading document:", error);
        }
    }

    const BasicInformation = ({ data }: { data: BasicDetails }) => {
        return (
            <Card
                style={{ background: "#fff", marginBottom: 24 }}
            >
                <Typography.Title level={5} style={{ marginBottom: 16 }}>
                    Basic Information
                </Typography.Title>
                <Descriptions
                    bordered
                    size="middle"
                    column={1}
                    labelStyle={{ width: '60%', backgroundColor: '#f5f5f5' }}
                    contentStyle={{ width: '40%' }}
                >
                    <Descriptions.Item label="Name">{data.name}</Descriptions.Item>
                    <Descriptions.Item label="Mobile Number">{data.mobileNumber}</Descriptions.Item>
                    <Descriptions.Item label="Ward">{data.ward}</Descriptions.Item>
                </Descriptions>
            </Card>
        );
    };

    const ProblemsInfo = ({ data }: { data: Problems[] }) => {
        return (
            <Card
                style={{ background: "#fff", marginBottom: 24 }}
            >
                <Typography.Title level={5} style={{ marginBottom: 16, fontSize: "20px" }}>
                    Problems
                </Typography.Title>
                {data.map((item) => (
                    <Card
                        style={{ marginBottom: 16 }}
                        bordered={false}
                    >
                        <Typography.Title level={5} style={{ marginBottom: 16 }}>
                            {item.description.english} ({item.description.hindi})
                        </Typography.Title>
                        {item.category.map((category) => (
                            <Tag color="blue">{category}</Tag>
                        ))}
                    </Card>
                ))}
            </Card>
        )
    }


    return (
        <MainAreaLayout
            title="Document"
            description={
                `Requests > Documents > ${name}'s Document`
            }
            extra={
                <Button
                    type="primary"
                    onClick={() => handleDownloadDoc()}
                >
                    Download Original Document
                </Button>
            }
        >
            <BasicInformation data={basicDetails} />
            <ProblemsInfo data={problems} />
        </MainAreaLayout>
    )
};

export default Document;