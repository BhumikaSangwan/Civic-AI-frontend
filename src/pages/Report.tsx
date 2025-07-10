import React from "react";
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import MainAreaLayout from "../components/main-layout/main-layout";
import { requestClient } from "../store";
import { Button, Card, Typography, Tag } from "antd";
import ProblemChart from "../components/Chart";
import { Modal, Table } from "antd";
import { useNavigate } from "react-router-dom";
import './index.css';


interface Problem {
    id: string;
    key: string;
    issues: string[];
    summary: string;
    problemIds: {
        docId: string;
        problemId: string;
    }[];
}

interface Ward {
    wardId: string;
    key: string;
    ward: string;
    category: string;
    problems: [{
        issues: string[];
        summary: string;
        problemIds: {
            docId: string;
            problemId: string;
        }
    }];
}

interface Analysis {
    ward: string;
    totalProblems: number;
    category: {
        issue: string;
        problemCount: number;
    }[]
}

interface IssueProblems {
    docId: string;
    key: string;
    ward: string;
    name: string;
    phoneNumber: string;
    description: string;
    category: string;
    problemId: string
}


const Report: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [reqName, setReqName] = useState<string | null>("");
    const [activeTab, setActiveTab] = useState<"common" | "ward" | "analysis">("common");
    const [problems, setProblems] = useState<Problem[]>([]);
    const [wards, setWards] = useState<Ward[]>([]);
    const [analysis, setAnalysis] = useState<Analysis[]>([]);
    const [wardDataFetched, setWardDataFetched] = useState(false);
    const [analysisDataFetched, setAnalysisDataFetched] = useState(false);
    const [issueCommonProblems, setIssueCommonProblems] = useState<IssueProblems[]>([]);

    const [selectedIssue, setSelectedIssue] = useState<string | null>(null);
    const [issueModalVisible, setIssueModalVisible] = useState(false);
    const [issuePagination, setIssuePagination] = useState({ current: 1, pageSize: 5 });

    const [groupPagination, setGroupPagination] = useState({ current: 1, pageSize: 5 });
    const [groupedProblems, setGroupedProblems] = useState<IssueProblems[]>([]);
    const [groupModalVisible, setGroupModalVisible] = useState(false);

    const [wardGroupedProblems, setWardGroupedProblems] = useState<IssueProblems[]>([]);
    const [wardGroupModalVisible, setWardGroupModalVisible] = useState(false);
    const [wardGroupPagination, setWardGroupPagination] = useState({ current: 1, pageSize: 5 });

    const [wardAnalysisProblems, setWardAnalysisProblems] = useState<IssueProblems[]>([]);
    const [wardAnalysisModalVisible, setWardAnalysisModalVisible] = useState(false);
    const [wardAnalysisPagination, setWardAnalysisPagination] = useState({ current: 1, pageSize: 5 });


    const navigate = useNavigate();

    const tabStyle = (tabKey: string) => ({
        padding: "12px 20px",
        cursor: "pointer",
        borderBottom: activeTab === tabKey ? "3px solid #1890ff" : "3px solid transparent",
        color: activeTab === tabKey ? "#1890ff" : "#000",
        fontWeight: activeTab === tabKey ? 600 : 500,
        fontSize: "16px",
        transition: "all 0.3s",
    });

    useEffect(() => {
        if (id) {
            fetchRequest();
        }
    }, [id]);

    useEffect(() => {
        if (activeTab === "ward" && !wardDataFetched) {
            fetchWardWiseReport();
        }
    }, [activeTab, wardDataFetched]);

    useEffect(() => {
        if (activeTab === "analysis" && !analysisDataFetched) {
            fetchAnalysis();
        }
    }, [activeTab, analysisDataFetched]);

    const handleTagClick = async (issue: string) => {
        try {
            if (!id) return;
            // Send request with reqId and issue value
            const res = await requestClient.getTaggedDocs({ reqId: id, issue });
            const matchingProblems = res.flatMap((doc: any) =>
                (doc.problems || []).map((problem: any) => ({
                    docId: doc.id,
                    key: doc.id,
                    ward: doc.ward,
                    name: doc.name.includes("(")
                        ? doc.name.split("(")[0].trim()
                        : doc.name,
                    phoneNumber: doc.phoneNumber,
                    description: problem.description.english,
                    category: problem.category,
                    problemId: problem.id
                }))
            );

            setSelectedIssue(issue);
            setIssuePagination({ current: 1, pageSize: 5 });
            setIssueCommonProblems(matchingProblems);
            setIssueModalVisible(true);
        } catch (err) {
            console.error("Error sending tag click:", err);
        }
    };

    const fetchRequest = async () => {
        try {
            if (!id) return;
            const response = await requestClient.getCommonProblems(id);
            setReqName(response.title);

            const formatted = response.commonProblems.map((item: any) => ({
                key: item.id,
                id: item.id,
                issues: item.issues,
                summary: item.summary,
                problemIds: item.problemIds
            }))

            setProblems(formatted);
        } catch (error) {
            console.log("error fetching request : ", error);
        }
    }

    const fetchWardWiseReport = async () => {
        try {
            if (!id) return;
            const response = await requestClient.getWardWiseReport(id);
            const formatted = response.wards.map((item: any) => ({
                wardId: item.wardId,
                key: item.wardId,
                ward: item.ward,
                category: item.category,
                problems: item.problems
            }))
            setWards(formatted);
            setWardDataFetched(true);
        } catch (error) {
            console.log("error fetching request : ", error);
        }
    }

    const fetchAnalysis = async () => {
        try {
            if (!id) return;
            const response = await requestClient.getAnalysis(id);
            setAnalysisDataFetched(true);

            const formatted = response.map((item: any) => ({
                ward: item.ward,
                totalProblems: item.totalProblems,
                category: item.category
            }))
            setAnalysis(formatted);

        } catch (error) {
            console.log("error fetching request : ", error);
        }
    }

    const handleViewDocument = async (record: IssueProblems) => {
        try {
            if (!id) return;
            navigate(`/dashboard/document/${id}/${record.docId}`);
        } catch (error) {
            console.log("error fetching request : ", error);
        }
    }

    const handleShowGroup = async (problemIds: { docId: string; problemId: string }[]) => {
        try {
            if (!id) return;
            const response = await requestClient.getGroupedIssues({ id, problemIds: problemIds });

            const flattened = response.flatMap((doc: any) =>
                (doc.problems || []).map((problem: any) => ({
                    docId: doc.id,
                    key: doc.id,
                    ward: doc.ward,
                    name: doc.name.includes("(")
                        ? doc.name.split("(")[0].trim()
                        : doc.name,
                    phoneNumber: doc.phoneNumber,
                    description: problem.description.english,
                    category: problem.category,
                    problemId: problem.id
                }))
            );

            setGroupedProblems(flattened);
            setGroupPagination({ current: 1, pageSize: 5 });
            setGroupModalVisible(true);
        } catch (error) {
            console.log("error fetching request : ", error);
        }
    }

    const handleShowWardGroup = async (problemIds: { docId: string, problemId: string }[]) => {
        try {
            if (!id) return;
            const response = await requestClient.getGroupedIssues({ id, problemIds: problemIds });


            const flattened = response.flatMap((doc: any) =>
                (doc.problems || []).map((problem: any) => ({
                    docId: doc.id,
                    key: doc.id,
                    ward: doc.ward,
                    name: doc.name.includes("(")
                        ? doc.name.split("(")[0].trim()
                        : doc.name,
                    phoneNumber: doc.phoneNumber,
                    description: problem.description.english,
                    category: problem.category,
                    problemId: problem.id
                }))
            );

            setWardGroupedProblems(flattened);
            setWardGroupPagination({ current: 1, pageSize: 5 });
            setWardGroupModalVisible(true);
        } catch (error) {
            console.log("error fetching ward group: ", error);
        }
    };

    async function handleShowIssueProblems(ward: string, issue: string) {
        if (!id) return;
        const res = await requestClient.getWardIssueProblems({ id, ward, issue });
        const flattened = res.flatMap((doc: any) =>
            doc.problems
                ? [{
                    docId: doc.id,
                    key: doc.id,
                    ward: doc.ward,
                    name: doc.name.includes("(")
                        ? doc.name.split("(")[0].trim()
                        : doc.name,
                    phoneNumber: doc.phoneNumber,
                    description: doc.problems.description.english,
                    category: doc.problems.category,
                    problemId: doc.problems.id
                }]
                : []
        );

        setWardAnalysisProblems(flattened);
        setWardAnalysisPagination({ current: 1, pageSize: 5 });
        setWardAnalysisModalVisible(true);
    }


    const commonProblemsContent = () => (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {problems.map((item) => (
                <Card key={item.id}>
                    <Typography.Title level={5}>
                        {item.summary}
                        <span
                            style={{ color: "blue", cursor: "pointer" }}
                            onClick={() => handleShowGroup(item.problemIds)}
                        >
                            ({item.problemIds.length})
                        </span>
                    </Typography.Title>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                        {item.issues.map((issue, index) => (
                            <Tag
                                color="blue"
                                key={index}
                                style={{ cursor: "pointer" }}
                                onClick={() => handleTagClick(issue)}
                            >
                                {issue}
                            </Tag>
                        ))}
                    </div>
                </Card>
            ))}
        </div>
    );

    const wardContent = () => {
        if (!wards || wards.length === 0) {
            return <Typography.Text type="secondary" style={{ fontSize: "16px" }}>
                No ward-wise problems found.
            </Typography.Text>;
        }

        return wards.map((item) => (
            <Card key={item.wardId} style={{ marginBottom: "24px" }}>
                {/* Ward Header */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                    <Typography.Title level={4} style={{ margin: 0 }}>
                        Ward No.: {item.ward}
                    </Typography.Title>
                    <Tag color="geekblue" style={{ fontSize: 16, padding: "4px 12px" }}>
                        {item.category}
                    </Tag>
                </div>

                {/* Problem Cards */}
                {item.problems.map((problem, index) => (
                    <Card key={index} style={{ marginBottom: "16px", backgroundColor: "#fafafa" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", gap: "16px", alignItems: "start" }}>
                            {/* Summary (left) */}
                            <div style={{ flex: 3 }}>
                                <Typography.Text strong style={{ fontSize: "16px" }}>
                                    {problem.summary}
                                    <span
                                        style={{ cursor: "pointer", color: "blue" }}
                                        onClick={() => {
                                            console.log("handleShowWardGroup", problem.problemIds);
                                            handleShowWardGroup(problem.problemIds)
                                        }
                                        }
                                    >
                                        ({problem.problemIds.length})
                                    </span>
                                </Typography.Text>
                            </div>

                            {/* Issues (right) */}
                            <div
                                style={{
                                    flex: 2,
                                    display: "flex",
                                    flexWrap: "wrap",
                                    gap: "8px",
                                    justifyContent: "flex-end"
                                }}
                            >
                                {problem.issues.map((issue, index) => (
                                    <Tag
                                        color="blue"
                                        key={index}
                                        style={{
                                            cursor: "pointer",
                                            fontSize: "15px",
                                            padding: "4px 10px"
                                        }}
                                    >
                                        {issue}
                                    </Tag>
                                ))}
                            </div>
                        </div>
                    </Card>
                ))}
            </Card>
        ));
    };


    return (
        <MainAreaLayout
            title={"Report"}
            description={
                <span>Requests {'>'} {reqName}</span>
            }
            extra={<>
                <Button
                    type="primary"
                    onClick={() => {
                        console.log("print")
                        window.print()
                    }
                    }
                >
                    Print
                </Button>
            </>
            }
        >
            {/* Tab Header */}
            <div style={{ display: "flex", borderBottom: "1px solid #f0f0f0", marginBottom: "20px" }}>
                <div style={tabStyle("common")} onClick={() => setActiveTab("common")}>
                    Common Problems
                </div>
                <div style={tabStyle("ward")} onClick={() => setActiveTab("ward")}>
                    Ward Wise Report
                </div>
                <div style={tabStyle("analysis")} onClick={() => setActiveTab("analysis")}>
                    Analysis
                </div>
            </div>

            {/* Tab Content */}
            <div className="print-scroll">
                {activeTab === "common" && commonProblemsContent()}
                {activeTab === "ward" && wardContent()}
                {activeTab === "analysis" && <ProblemChart
                    reportData={{ analytics: analysis }}
                    activeTab={activeTab}
                    showIssueProblems={handleShowIssueProblems}
                />}
            </div>

            <Modal
                title={`Problems for issue: ${selectedIssue}`}
                open={issueModalVisible}
                onCancel={() => setIssueModalVisible(false)}
                footer={null}
                width={800}
            >
                <Table
                    dataSource={issueCommonProblems}
                    rowKey="problemId"
                    pagination={{
                        ...issuePagination,
                        onChange: (page, pageSize) => setIssuePagination({ current: page, pageSize }),
                    }}

                    columns={[
                        {
                            title: "S. No.",
                            key: "index",
                            render: (_: any, __: any, index: number) =>
                                (issuePagination.current - 1) * issuePagination.pageSize + index + 1,
                        },
                        {
                            title: "Name",
                            dataIndex: "name",
                            key: "name",
                            render: (text) => text || "N/A"
                        },
                        {
                            title: "Mobile Number",
                            dataIndex: "phoneNumber",
                            key: "phoneNumber",
                        },
                        {
                            title: "Ward",
                            dataIndex: "ward",
                            key: "ward"
                        },
                        {
                            title: "Problems",
                            key: "description",
                            render: (_, record: IssueProblems) => (
                                <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8 }}>
                                    <Typography.Text style={{ marginRight: 8 }}>{record.description}</Typography.Text>(
                                    {Array.isArray(record.category) ? (
                                        record.category.map((cat, idx) => (
                                            <Tag key={idx} >{cat}</Tag>
                                        ))
                                    ) : (
                                        <Tag>{record.category}</Tag>
                                    )})
                                </div>
                            )
                        },
                        {
                            title: "Actions",
                            key: "actions",
                            render: (_, record) => (
                                <Button onClick={() => handleViewDocument(record)} type="primary" size="middle">
                                    View Document
                                </Button>
                            )
                        }
                    ]}
                />
            </Modal>

            <Modal
                title="Grouped Problems"
                open={groupModalVisible}
                onCancel={() => setGroupModalVisible(false)}
                footer={null}
                width={800}
            >
                <Table
                    dataSource={groupedProblems}
                    rowKey="problemId"
                    pagination={{
                        ...groupPagination,
                        onChange: (page, pageSize) => setGroupPagination({ current: page, pageSize }),
                    }}

                    columns={[
                        {
                            title: "S. No.",
                            key: "index",
                            render: (_: any, __: any, index: number) =>
                                (groupPagination.current - 1) * groupPagination.pageSize + index + 1,
                        },
                        {
                            title: "Name",
                            dataIndex: "name",
                            key: "name",
                            render: (text) => text || "N/A"
                        },
                        {
                            title: "Mobile Number",
                            dataIndex: "phoneNumber",
                            key: "phoneNumber",
                        },
                        {
                            title: "Ward",
                            dataIndex: "ward",
                            key: "ward"
                        },
                        {
                            title: "Problems",
                            key: "description",
                            render: (_, record: IssueProblems) => (
                                <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8 }}>
                                    <Typography.Text style={{ marginRight: 8 }}>{record.description}</Typography.Text>
                                    {Array.isArray(record.category) ? (
                                        record.category.map((cat, idx) => (
                                            <Tag key={idx}>{cat}</Tag>
                                        ))
                                    ) : (
                                        <Tag>{record.category}</Tag>
                                    )}
                                </div>
                            )
                        },
                        {
                            title: "Actions",
                            key: "actions",
                            render: (_, record) => (
                                <Button onClick={() => handleViewDocument(record)} type="primary" size="middle">
                                    View Document
                                </Button>
                            )
                        }
                    ]}
                />
            </Modal>

            <Modal
                title="Ward-Wise Grouped Problems"
                open={wardGroupModalVisible}
                onCancel={() => setWardGroupModalVisible(false)}
                footer={null}
                width={800}
            >
                <Table
                    dataSource={wardGroupedProblems}
                    rowKey="problemId"
                    pagination={{
                        ...wardGroupPagination,
                        onChange: (page, pageSize) => setWardGroupPagination({ current: page, pageSize }),
                    }}
                    columns={[
                        {
                            title: "S. No.",
                            key: "index",
                            render: (_: any, __: any, index: number) =>
                                (wardGroupPagination.current - 1) * wardGroupPagination.pageSize + index + 1,
                        },
                        {
                            title: "Name",
                            dataIndex: "name",
                            key: "name",
                            render: (text) => text || "N/A"
                        },
                        {
                            title: "Mobile Number",
                            dataIndex: "phoneNumber",
                            key: "phoneNumber",
                        },
                        {
                            title: "Ward",
                            dataIndex: "ward",
                            key: "ward"
                        },
                        {
                            title: "Problems",
                            key: "description",
                            render: (_, record: IssueProblems) => (
                                <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8 }}>
                                    <Typography.Text style={{ marginRight: 8 }}>{record.description}</Typography.Text>
                                    {Array.isArray(record.category) ? (
                                        record.category.map((cat, idx) => (
                                            <Tag key={idx}>{cat}</Tag>
                                        ))
                                    ) : (
                                        <Tag>{record.category}</Tag>
                                    )}
                                </div>
                            )
                        },
                        {
                            title: "Actions",
                            key: "actions",
                            render: (_, record) => (
                                <Button onClick={() => handleViewDocument(record)} type="primary" size="middle">
                                    View Document
                                </Button>
                            )
                        }
                    ]}
                />
            </Modal>

            <Modal
                title="Ward Analysis Problems"
                open={wardAnalysisModalVisible}
                onCancel={() => setWardAnalysisModalVisible(false)}
                footer={null}
                width={800}
            >
                <Table
                    dataSource={wardAnalysisProblems}
                    rowKey="problemId"
                    pagination={{
                        ...wardAnalysisPagination,
                        onChange: (page, pageSize) => setWardAnalysisPagination({ current: page, pageSize }),
                    }}
                    columns={[
                        {
                            title: "S. No.",
                            key: "index",
                            render: (_: any, __: any, index: number) =>
                                (wardGroupPagination.current - 1) * wardGroupPagination.pageSize + index + 1,
                        },
                        {
                            title: "Name",
                            dataIndex: "name",
                            key: "name",
                            render: (text) => text || "N/A"
                        },
                        {
                            title: "Mobile Number",
                            dataIndex: "phoneNumber",
                            key: "phoneNumber",
                        },
                        {
                            title: "Ward",
                            dataIndex: "ward",
                            key: "ward"
                        },
                        {
                            title: "Problems",
                            key: "description",
                            render: (_, record: IssueProblems) => (
                                <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8 }}>
                                    <Typography.Text style={{ marginRight: 8 }}>{record.description}</Typography.Text>
                                    {Array.isArray(record.category) ? (
                                        record.category.map((cat, idx) => (
                                            <Tag key={idx}>{cat}</Tag>
                                        ))
                                    ) : (
                                        <Tag>{record.category}</Tag>
                                    )}
                                </div>
                            )
                        },
                        {
                            title: "Actions",
                            key: "actions",
                            render: (_, record) => (
                                <Button onClick={() => handleViewDocument(record)} type="primary" size="middle">
                                    View Document
                                </Button>
                            )
                        }
                    ]}
                />
            </Modal>


        </MainAreaLayout>
    )
}

export default Report