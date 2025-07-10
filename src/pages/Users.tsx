import React, { useState } from "react";
import { Button, Drawer, Form, Input, Popconfirm, Select, Space } from "antd";
import CustomTable from "../components/CustomTable";
import { roles } from "../libs/constants";
import { useAppStore, userClient } from "../store";
import MainAreaLayout from "../components/main-layout/main-layout";
import { useMessage } from "../hooks/message";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Link } from "react-router";

interface User {
	id: string;
	name: string;
	email: string;
}

 const Users: React.FC = () => {
	const message = useMessage();
	const getRole = useAppStore((state) => state.getRole);
	const setAppLoader = useAppStore().setAppLoading;

	const [isDrawerOpen, setIsDrawerOpen] = useState(false);
	const [selectedUser, setSelectedUser] = useState<User | null>(null);
	const [isEditing, setIsEditing] = useState(false);
	const [form] = Form.useForm();


	const userData = useQuery({
		queryKey: ["userData"],
		queryFn: async () => {
			try {
				const users = await userClient.list();
				return users;
			} catch (error) {
				if (error instanceof Error) {
					message.error(error.message);
					return;
				}
				if (typeof error === "string") {
					message.error(error);
					return;
				}
				message.error("Something went wrong");
				return;
			}
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

	const resetFormState = () => {
		setIsDrawerOpen(false);
		setSelectedUser(null);
		setTimeout(() => {
			form.resetFields();
			setIsEditing(false);
		}, 100);
	};

	const deleteUser = useMutation({
		mutationFn: async ({
			userId,
		}: {
			userId: string;
		}) => {
			setAppLoader(true);
			await userClient.delete(userId);
			return;
		},
		onSuccess: () => {
			userData.refetch();
			message.success("User deleted successfully");
		},
		onError: (err) => {
			handleError(err);
		},
		onSettled: () => {
			setAppLoader(false);
		},
	});

	const handleEdit = async () => {
		try {
			const values = await form.validateFields();

			if (isEditing && selectedUser) {
				await userClient.updateUser(
					selectedUser.id,
					{
						name: values.name,
					}
				);
				message.success("User updated successfully!");
			} else {
				await userClient.createNewUser( values);
				message.success("User added successfully!");
			}
			userData.refetch();
			resetFormState();
		} catch (err) {
			handleError(err, "Failed to save user");
		}
	};

	const handleEditUser = (user: User) => {
		setSelectedUser(user);
		form.setFieldsValue({
			...user
		});
		setIsEditing(true);
		setIsDrawerOpen(true);
	};

	const columns = [
		{ title: "Name", dataIndex: "name", key: "name" },
		{ title: "Email", dataIndex: "email", key: "email" },
		{
            title: "Actions",
			key: "actions",
			render: (record: User) => (
				<Space>
					<Button onClick={() => handleEditUser(record)}>Edit</Button>
					<Popconfirm
						title="Delete this user?"
						onConfirm={() => {
							deleteUser.mutate({
								userId: record.id,
							});
						}}
					>
						<Button danger>Delete</Button>
					</Popconfirm>
				</Space>
			),
		},
	];

	return (
		<MainAreaLayout
			title={`Manage Users`}
			extra={
				<Button
					type="primary"
					onClick={() => {
						setIsDrawerOpen(true);
						setIsEditing(false);
						form.resetFields();
					}}
				>
					Add User
				</Button>
			}
		>
			<CustomTable
				columns={columns}
				data={userData.data ?? []}
				loading={userData.isLoading}
				serialNumberConfig={{ name: "", show: true }}
			/>

			<Drawer
				title={isEditing ? "Edit User" : "Add User"}
				placement="right"
				width={400}
				open={isDrawerOpen}
				onClose={resetFormState}
			>
				<Form
					layout="vertical"
					form={form}
					onFinish={handleEdit}
				>
					<Form.Item
						label="Name"
						name="name"
						rules={[
							{ required: true, message: "Name is required" },
						]}
					>
						<Input placeholder="Enter name" />
					</Form.Item>

					<Form.Item
						label="Email"
						name="email"
						normalize={(value) => value?.toLowerCase()}
						rules={[
							{
								required: true,
								type: "email",
								message: "Valid email is required",
							},
						]}
					>
						<Input placeholder="Enter email" disabled={isEditing} />
					</Form.Item>

					
					<Button type="primary" block htmlType="submit">
						{isEditing ? "Update User" : "Add User"}
					</Button>
				</Form>
			</Drawer>
		</MainAreaLayout>
	);
};

export default Users;