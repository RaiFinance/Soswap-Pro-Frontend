import React, { useEffect, useState } from 'react'
import { Modal, Form, Input, Button, Checkbox, message } from 'antd';
import { useTranslation } from 'react-i18next'
import ReactMarkdown from 'react-markdown'
import {  TwitterOutlined, GithubOutlined } from '@ant-design/icons';
import useThrottle from "@rooks/use-throttle"
import { useActiveWeb3React } from '../../hooks'
// import { postManagerProfile } from '../Proposals/hooks'
import {ReactComponent as Email} from 'assets/svg/email.svg'
//@ts-ignore
import * as Termofuse from './Termofuse.md'

import './index.less';

export default function ({isOpen, handleCancel, agree, setAgree }: any){
    const { chainId, account, library } = useActiveWeb3React()
    const { t } = useTranslation()
    const [text, useText] = useState('')

    useEffect(() => {
        fetch(Termofuse).then((response) => response.text()).then((text) => {
            useText(text)
        })
    },[]) 
    
    return (
        <Modal className="termofuseModal" title="Terms of Use" width={1056} visible={isOpen} footer={null} onCancel={handleCancel}>
            <div className='description'>
                <ReactMarkdown>
                    {text}
                 </ReactMarkdown>
            </div>
            {setAgree && <Form
                name="basic"
                autoComplete="off"
                initialValues={{agree}}
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
                    <Checkbox onChange={(e: any) => {setAgree(e.target.checked)}}>I attest to the above and agree to the Terms of Use.</Checkbox>
                </Form.Item>
                <Form.Item>
                    <Button type="primary" htmlType="submit" onClick={() => {setAgree(true); handleCancel()}}>
                        Agree
                    </Button>
                </Form.Item>
            </Form>}
        </Modal>
    ) 
}