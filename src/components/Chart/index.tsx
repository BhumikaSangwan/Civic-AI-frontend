import { useEffect, useState } from "react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Legend,
} from "recharts";
import Slider from "@mui/material/Slider";

interface IssueCategory {
    issue: string;
    problemCount: number;
}

interface WardData {
    ward: string;
    totalProblems: number;
    category?: IssueCategory[];
}

interface ProblemChartProps {
    reportData: {
        analytics?: WardData[];
    };
    activeTab: string;
    showIssueProblems: (ward: string, issue: string) => void;
}

const COLORS = [
    "#8884d8", "#82ca9d", "#ffc658", "#ff7f50", "#a0522d", "#8a2be2",
    "#00bcd4", "#e91e63", "#00acc1", "#cddc39", "#ff9800", "#9c27b0",
    "#607d8b", "#f44336", "#3f51b5", "#009688", "#ff5722", "#4caf50",
    "#795548", "#2196f3", "#ffb300", "#673ab7", "#ff4081", "#66bb6a"
];

const ProblemChart = ({ reportData, activeTab, showIssueProblems }: ProblemChartProps) => {
    const analytics = reportData?.analytics || [];

    // Filter numeric wards
    const numericWards = analytics
        .filter((a) => !isNaN(Number(a.ward)))
        .map((a) => Number(a.ward));

    const minWard = numericWards.length ? Math.min(...numericWards) : 0;
    const maxWard = numericWards.length ? Math.max(...numericWards) : 0;

    const includesUnknownWard = analytics.some(a => a.ward === "Ward not provided");
    const effectiveMaxWard = includesUnknownWard ? maxWard + 1 : maxWard;


    const hasValidData = analytics.length > 0 && numericWards.length > 0;

    const [wardRange, setWardRange] = useState<[number, number]>([minWard, maxWard]);
    const [selectedWard, setSelectedWard] = useState<string | null>(null);
    const [visibleIssues, setVisibleIssues] = useState<string[]>([]);

    useEffect(() => {
        if (hasValidData) {
            setWardRange([minWard, maxWard]);
        }
    }, [minWard, maxWard]);

    // Sort data: numeric wards first, then "Ward not provided"
    const sortedAnalytics = [...analytics].sort((a, b) => {
        const aNum = Number(a.ward);
        const bNum = Number(b.ward);

        const isANum = !isNaN(aNum);
        const isBNum = !isNaN(bNum);

        if (isANum && isBNum) return aNum - bNum;
        if (isANum) return -1;
        if (isBNum) return 1;
        return 0;
    });

    const filteredData = sortedAnalytics.filter((a) => {
        const wardNum = Number(a.ward);
        const isNumeric = !isNaN(wardNum);
        return (isNumeric && wardNum >= wardRange[0] && wardNum <= wardRange[1]) || a.ward === "Ward not provided";
    });

    const selectedWardData = analytics.find((a) => a.ward === selectedWard);
    const selectedIssues = selectedWardData?.category || [];

    useEffect(() => {
        if (selectedIssues.length > 0) {
            setVisibleIssues(selectedIssues.map((c) => c.issue));
        }
    }, [selectedWard]);

    if (activeTab !== "analysis" || !hasValidData) return null;

    return (
        <div className="flex flex-col lg:flex-row gap-6 bg-white p-6 shadow rounded-lg transition-all duration-300 min-h-[600px]">
            {/* Bar Chart */}
            <div className={`${selectedWard ? "w-full lg:w-1/2" : "w-full"} transition-all duration-300`}>
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Problem Count by Ward</h3>

                <Slider
                    value={wardRange}
                    onChange={(_, newValue) => {
                        if (Array.isArray(newValue)) {
                            setWardRange([
                                Math.floor(newValue[0]),
                                Math.floor(newValue[1]),
                            ]);
                        }
                    }}
                    valueLabelDisplay="auto"
                    step={1}
                    min={minWard}
                    max={effectiveMaxWard}
                />
                <p className="text-sm text-gray-600 mb-4">
                    Showing wards {wardRange[0]} to {wardRange[1]}
                </p>

                <ResponsiveContainer width="100%" height={400}>
                    <BarChart
                        data={filteredData}
                        margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
                        onClick={(e: any) => {
                            const ward = e?.activeLabel;
                            if (ward !== undefined) {
                                setSelectedWard(String(ward));
                            }
                        }}
                    >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="ward" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="totalProblems" fill="#4f46e5" />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* Pie Chart */}
            {selectedWard !== null && selectedIssues.length > 0 && (
                <div className="w-full lg:w-1/2 transition-all duration-300">
                    <h3 className="text-xl font-semibold text-gray-800 mb-4">
                        {selectedWard}'s Tags
                    </h3>

                    {/* Tag Controls */}
                    <div className="mb-4 flex flex-wrap gap-3">
                        {selectedIssues.map((item, index) => {
                            const isActive = visibleIssues.includes(item.issue);
                            const color = COLORS[index % COLORS.length];

                            return (
                                <div
                                    key={item.issue}
                                    onClick={() =>
                                        setVisibleIssues((prev) =>
                                            prev.includes(item.issue)
                                                ? prev.filter((i) => i !== item.issue)
                                                : [...prev, item.issue]
                                        )
                                    }
                                    className={`flex items-center gap-2 cursor-pointer px-2 py-1 rounded-lg text-sm transition-all `}
                                >
                                    <div
                                        className="w-3 h-3 full"
                                        style={{ backgroundColor: isActive ? color : "#9ca3af" }}
                                    ></div>
                                    <span className="truncate max-w-[120px]" style={{ color: isActive ? color : "#9ca3af" }}>
                                        {item.issue.length > 18 ? item.issue.slice(0, 18) + "..." : item.issue}
                                    </span>
                                </div>
                            );
                        })}
                    </div>

                    {/* Pie Chart */}
                    <ResponsiveContainer width="100%" height={400}>
                        <PieChart>
                            <Pie
                                data={selectedIssues.filter((c) => visibleIssues.includes(c.issue))}
                                dataKey="problemCount"
                                nameKey="issue"
                                cx="50%"
                                cy="50%"
                                outerRadius={150}
                                innerRadius={80}
                                label={({ name }) =>
                                    name.length > 18 ? name.slice(0, 18) + "..." : name
                                }
                            >
                                {selectedIssues
                                    .filter((c) => visibleIssues.includes(c.issue))
                                    .map((entry) => {
                                        const originalIndex = selectedIssues.findIndex(
                                            (e) => e.issue === entry.issue
                                        );
                                        return (
                                            <Cell
                                                key={`cell-${entry.issue}`}
                                                fill={COLORS[originalIndex % COLORS.length]}
                                                onClick={() => {
                                                    showIssueProblems(selectedWard,entry.issue);
                                                }}
                                            />
                                        );
                                    })}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            )}


        </div>
    );
};

export default ProblemChart;

