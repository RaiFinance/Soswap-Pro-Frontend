import React, { useState } from 'react'
import { Modal, Form, Input, Button, Checkbox, message } from 'antd';
import { useTranslation } from 'react-i18next'
import numeral from 'numeral';
import { useActiveWeb3React } from '../../hooks'
import TermOfUseModal from './TermOfUseModal';
import { BUY } from './PredictDetail';

import './index.less';

export default function ({isOpen, handleCancel, amount, avgPrice, handleConfirm, outcome, activeAction }: any){
    const { chainId, account, library } = useActiveWeb3React()
    const { t } = useTranslation()
    const [form] = Form.useForm();
    const [showTermOfUseModal,  setShowTermOfUseModal] = useState(false)
    const onFinish = (values: any) => {
        if(values.agree){
            handleConfirm()
        }
    }
    const onFinishFailed = (errorInfo: any) => {
        console.log('Failed:', errorInfo);
    };
    return (
        <Modal className="predictConfirmModal" title="Confirm Transaction" width={642} visible={isOpen} footer={null} onCancel={handleCancel}>
            <div className='info'>
                <div>
                    <div>Outcome</div>
                    <div>{outcome}</div>
                </div>
                <div>
                    <div>{activeAction === BUY ? "Pred Amount" : "Share Amount"}</div>
                    <div>{numeral(amount).format('0,0.00')} Pred</div>
                </div>
                <div>
                    <div>Your Avg. Price</div>
                    <div>{numeral(avgPrice).format('0,0.00')} Pred</div>
                </div>
            </div>
            <Form
                name="basic"
                autoComplete="off"
                form={form}
                onFinish={onFinish}
                onFinishFailed={onFinishFailed}
            >
                <Form.Item 
                    name="agree" 
                    valuePropName="checked"
                    rules={[
                        // {required: true, message: 'Should accept the Terms of Use!'},
                    {
                        validator: (_, value) =>
                        value ? Promise.resolve() : Promise.reject(new Error('Should accept the Terms of Use')),
                    },
                    ]}
                >
                    <Checkbox>&nbsp;I attest to the above and agree to the <a onClick={() => {setShowTermOfUseModal(true)}}>Terms of Use.</a></Checkbox>
                </Form.Item>
                <Form.Item>
                    <Button type="primary" htmlType="submit">
                        {t('confirm')}
                    </Button>
                </Form.Item>
            </Form>
            <TermOfUseModal isOpen={showTermOfUseModal} agree={form.getFieldValue('agree')} setAgree={(agree: boolean) => {form.setFieldsValue({agree})}} handleCancel={() => {setShowTermOfUseModal(false)}}/>
        </Modal>
    ) 
}