import React from 'react';
import { Form, Upload, Button, message, Typography } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import CustomLayout from '../../Components/Layout/Layout';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const { Title } = Typography;

const BannerForm = () => {
    const [form] = Form.useForm();
    const navigate = useNavigate();

    const onFinish = (values) => {
        const formData = new FormData();
        const file = values.image && values.image[0];  // Get the first file from the fileList

        if (file && file.originFileObj) {
            formData.append('image', file.originFileObj);
            formData.append('type', 'banner');
            formData.append('displayOrder', 1);

            axios.post('http://localhost:3000/admin/slider/add', formData)
                .then(response => {
                    message.success('Banner uploaded successfully!');
                    form.resetFields();
                })
                .catch(error => {
                    message.error('Failed to upload banner');
                });
        } else {
            message.error('Please upload a valid image.');
        }
    };

    const goToBannerPage = () => {
        navigate('/banners');
    };

    return (
        <CustomLayout pageTitle="Add Banner" menuKey="12">
            <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px', backgroundColor: '#f9f9f9', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)' }}>
                <Title level={2} style={{ textAlign: 'center', color: '#00273E' }}>Add Banner</Title>
                <Form
                    form={form}
                    onFinish={onFinish}
                    layout="vertical"
                >
                    <Form.Item
                        label="Upload Image"
                        name="image"
                        valuePropName="fileList"
                        getValueFromEvent={(e) => e && e.fileList}
                        rules={[{ required: true, message: 'Please upload an image!' }]}
                    >
                        <Upload
                            name="image"
                            listType="picture"
                            beforeUpload={() => false}  // Prevent automatic upload
                        >
                            <Button icon={<UploadOutlined />} size="large" block>Click to Upload</Button>
                        </Upload>
                    </Form.Item>

                    <Button type="primary" htmlType="submit" size="large" block>Submit</Button>
                </Form>

                {/* New Button for navigating to the Banner List */}
                <Button
                    style={{ marginTop: '20px' }}
                    type="default"
                    size="large"
                    block
                    onClick={goToBannerPage}
                >
                    Go to Banner List
                </Button>
            </div>
        </CustomLayout>
    );
};

export default BannerForm;
