import React from "react";
import { useState, useEffect } from "react";
import { Typography, Tag, Button } from "antd";
import { FilterOutlined } from "@ant-design/icons";
import type { ColumnsType } from 'antd/es/table';
import { useParams } from "react-router-dom";
import MainAreaLayout from "../components/main-layout/main-layout";
import CustomTable from "../components/CustomTable";
import { requestClient } from "../store";
import { useNavigate } from "react-router-dom";
import Item from "antd/es/list/Item";

interface Request {
    key: string;
    id: string;
    name: string;
    ward?: string;
    phoneNumber?: string;
    problemCount?: number;
    tags: string[];
}

const Request: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [reqName, setReqName] = useState<string | null>("");
    const [documents, setDocuments] = useState<Request[]>([]);
    const [tags, setTags] = useState<string[]>([]);
    const [wards, setWards] = useState<string[]>([]);


    const navigate = useNavigate();

    useEffect(() => {
        if (id) {
            fetchRequest();
        }
    }, [id]);

    const fetchRequest = async () => {
        try {
            if (!id) return;
            const response = await requestClient.getRequestDetails(id);
            setReqName(response.title);

            const allTags: string[] = [];
            const allWards: string[] = [];

            const formatted = response.documents.map((item: any) => {
                const name = item.name.includes("(")
                    ? item.name.split("(")[0].trim()  
                    : item.name;

                allTags.push(...item.issues);
                allWards.push(item.ward);

                return {
                    key: item.id,
                    id: item.id,
                    name: name,
                    ward: item.ward ,
                    phoneNumber: item.phoneNumber,
                    problemCount: item.problems.length,
                    tags: item.issues
                }
            });
            setDocuments(formatted);
            // setFilteredDocuments(formatted);
            const uniqueTags = Array.from(new Set(allTags));
            setTags(uniqueTags);

            const uniqueWards = Array.from(new Set(allWards));
            setWards(uniqueWards);

        } catch (error) {
            console.error("Error fetching request:", error);
        }
    };

    const handleShowDocument = async (docId: string) => {
        try {
            if (!id || !docId) return;
            navigate(`/dashboard/document/${id}/${docId}`);
        } catch (error) {
            console.log("error showing document : ", error);
        }
    }

    const columns: ColumnsType<Request> = [
        {
            title: "Name",
            dataIndex: "name",
            key: "name"
        },
        {
            title: "Mobile Number",
            dataIndex: "phoneNumber",
            key: "phoneNumber"
        },
        {
            title: "Ward",
            dataIndex: "ward",
            key: "ward",
            filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
                <div style={{ padding: 8 }}>
                    {wards.map((ward) => (
                        <div key={ward}>
                            <label>
                                <input
                                    type="checkbox"
                                    value={ward}
                                    checked={selectedKeys.includes(ward)}
                                    onChange={(e) => {
                                        const checked = e.target.checked;
                                        const nextSelectedKeys = checked
                                            ? [...selectedKeys, ward]
                                            : selectedKeys.filter((k) => k !== ward);
                                        setSelectedKeys(nextSelectedKeys);
                                    }}
                                />{" "}
                                {ward}
                            </label>
                        </div>
                    ))}
                    <div style={{ marginTop: 8 }}>
                        <Button
                            type="primary"
                            onClick={() => confirm()}
                            size="small"
                            style={{ width: 90, marginRight: 8 }}
                        >
                            Apply
                        </Button>
                        <Button onClick={() => clearFilters?.()} size="small" style={{ width: 90 }}>
                            Reset
                        </Button>
                    </div>
                </div>
            ),
            filterIcon: (filtered: boolean) => (
                <FilterOutlined style={{ color: filtered ? "#1890ff" : undefined }} />
            ),
            onFilter: (value: boolean | string | number, record: Request) => {
                const ward = String(value);
                return record.ward.includes(ward);
            },
        },
        {
            title: "Problems",
            dataIndex: "problemCount",
            key: "problemCount"
        },
        {
            title: "Tags",
            // title: (
            //     <span>
            //         Tags <FilterOutlined />
            //     </span>
            // ),
            dataIndex: "tags",
            key: "tags",
            filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
                <div style={{ padding: 8 }}>
                    {tags.map((tag) => (
                        <div key={tag}>
                            <label>
                                <input
                                    type="checkbox"
                                    value={tag}
                                    checked={selectedKeys.includes(tag)}
                                    onChange={(e) => {
                                        const checked = e.target.checked;
                                        const nextSelectedKeys = checked
                                            ? [...selectedKeys, tag]
                                            : selectedKeys.filter((k) => k !== tag);
                                        setSelectedKeys(nextSelectedKeys);
                                    }}
                                />{" "}
                                {tag}
                            </label>
                        </div>
                    ))}
                    <div style={{ marginTop: 8 }}>
                        <Button
                            type="primary"
                            onClick={() => confirm()}
                            size="small"
                            style={{ width: 90, marginRight: 8 }}
                        >
                            Apply
                        </Button>
                        <Button onClick={() => clearFilters?.()} size="small" style={{ width: 90 }}>
                            Reset
                        </Button>
                    </div>
                </div>
            ),
            filterIcon: (filtered: boolean) => (
                <FilterOutlined style={{ color: filtered ? "#1890ff" : undefined }} />
            ),
            onFilter: (value: boolean | string | number, record: Request) => {
                const tag = String(value);
                return record.tags.includes(tag);
            },
            render: (tags: string[]) => (
                <>
                    {tags.map((tag) => (
                        <Tag key={tag}>{tag}</Tag>
                    ))}
                </>
            )
        },
        {
            title: "Actions",
            key: "actions",
            render: (item: Request) => (
                <>
                    <Button
                        type="primary"
                        onClick={() => handleShowDocument(item.id)}
                    >
                        View Document
                    </Button>
                </>
            )
        }
    ]

    return (
        <MainAreaLayout
            title={`Documents`}
            description={
                <>
                    Requests / <Typography.Text strong>{reqName}'s Documents</Typography.Text>
                </>
            }
        >
            <CustomTable
                columns={columns}
                data={documents}
                serialNumberConfig={{ name: "", show: true }}
            />
        </MainAreaLayout>
    )
};

export default Request;