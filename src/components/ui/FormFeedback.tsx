/**
 * FormFeedback - 表单验证反馈组件
 * 支持成功/错误/警告状态
 * 实时验证反馈
 */

import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

export type ValidationStatus = 'success' | 'error' | 'warning' | 'idle';

export interface FormFeedbackProps {
  /** 验证状态 */
  status?: ValidationStatus;
  /** 反馈消息 */
  message?: string;
  /** 子元素（输入框） */
  children: React.ReactNode;
  /** 验证函数 */
  validator?: (value: string) => { valid: boolean; message?: string; status?: ValidationStatus };
  /** 值变化回调 */
  onValueChange?: (value: string) => void;
  /** 自定义类名 */
  className?: string;
}

const statusColors = {
  idle: {
    border: 'border-[#2a2d3a]',
    focusBorder: 'focus:border-[#00d4ff]',
    focusRing: 'focus:ring-[rgba(0,212,255,0.12)]',
    text: 'text-[#8b8fa8]',
    icon: 'text-[#8b8fa8]',
  },
  success: {
    border: 'border-[#00ff88]',
    focusBorder: 'focus:border-[#00ff88]',
    focusRing: 'focus:ring-[rgba(0,255,136,0.12)]',
    text: 'text-[#00ff88]',
    icon: 'text-[#00ff88]',
  },
  error: {
    border: 'border-[#ff2d78]',
    focusBorder: 'focus:border-[#ff2d78]',
    focusRing: 'focus:ring-[rgba(255,45,120,0.12)]',
    text: 'text-[#ff2d78]',
    icon: 'text-[#ff2d78]',
  },
  warning: {
    border: 'border-[#ff9500]',
    focusBorder: 'focus:border-[#ff9500]',
    focusRing: 'focus:ring-[rgba(255,149,0,0.12)]',
    text: 'text-[#ff9500]',
    icon: 'text-[#ff9500]',
  },
};

const statusIcons = {
  idle: null,
  success: '✓',
  error: '✕',
  warning: '⚠',
};

export const FormFeedback: React.FC<FormFeedbackProps> = ({
  status = 'idle',
  message,
  children,
  validator,
  onValueChange,
  className,
}) => {
  const [currentStatus, setCurrentStatus] = useState<ValidationStatus>(status);
  const [currentMessage, setCurrentMessage] = useState(message);
  const [inputValue, setInputValue] = useState('');

  const colors = statusColors[currentStatus];

  // 监听子元素值变化
  useEffect(() => {
    if (!validator) return;

    const result = validator(inputValue);
    if (inputValue) {
      setCurrentStatus(result.status || (result.valid ? 'success' : 'error'));
      setCurrentMessage(result.message);
    } else {
      setCurrentStatus('idle');
      setCurrentMessage(undefined);
    }
  }, [inputValue, validator]);

  // 克隆子元素并注入props
  const childElement = React.Children.only(children) as React.ReactElement<any>;
  const enhancedChild = React.cloneElement(childElement, {
    value: inputValue,
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const value = e.target.value;
      setInputValue(value);
      onValueChange?.(value);
      childElement.props.onChange?.(e);
    },
    className: cn(
      childElement.props.className,
      colors.border,
      colors.focusBorder,
      currentStatus !== 'idle' && 'pr-10'
    ),
    'aria-invalid': currentStatus === 'error',
    'aria-describedby': currentMessage ? 'form-feedback-message' : undefined,
  });

  return (
    <div className={cn('relative', className)}>
      {/* 增强的输入框 */}
      {enhancedChild}

      {/* 状态图标 */}
      {currentStatus !== 'idle' && (
        <div
          className={cn(
            'absolute right-3 top-1/2 -translate-y-1/2 text-sm font-bold',
            colors.icon
          )}
          aria-hidden="true"
        >
          {statusIcons[currentStatus]}
        </div>
      )}

      {/* 反馈消息 */}
      {currentMessage && (
        <p
          id="form-feedback-message"
          className={cn(
            'mt-2 text-xs transition-all duration-200',
            colors.text,
            currentStatus === 'error' && 'animate-shake'
          )}
          role={currentStatus === 'error' ? 'alert' : 'status'}
        >
          {currentMessage}
        </p>
      )}

      {/* 抖动动画 */}
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-4px); }
          75% { transform: translateX(4px); }
        }
        .animate-shake {
          animation: shake 0.3s ease-in-out;
        }
      `}</style>
    </div>
  );
};

// 便捷验证器
export const validators = {
  required: (fieldName = '此字段') => (value: string) => ({
    valid: value.trim().length > 0,
    message: value.trim().length > 0 ? undefined : `${fieldName}不能为空`,
  }),

  email: (value: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return {
      valid: !value || emailRegex.test(value),
      message: value && !emailRegex.test(value) ? '请输入有效的邮箱地址' : undefined,
    };
  },

  minLength: (min: number) => (value: string) => ({
    valid: !value || value.length >= min,
    message: value && value.length < min ? `至少需要${min}个字符` : undefined,
  }),

  maxLength: (max: number) => (value: string) => ({
    valid: !value || value.length <= max,
    message: value && value.length > max ? `最多${max}个字符` : undefined,
  }),

  pattern: (regex: RegExp, message: string) => (value: string) => ({
    valid: !value || regex.test(value),
    message: value && !regex.test(value) ? message : undefined,
  }),

  combine: (...validators: Array<(value: string) => { valid: boolean; message?: string }>) => 
    (value: string) => {
      for (const validator of validators) {
        const result = validator(value);
        if (!result.valid) return result;
      }
      return { valid: true };
    },
};

// 预设表单字段
export const ValidatedInput: React.FC<{
  label: string;
  validator?: (value: string) => { valid: boolean; message?: string };
  placeholder?: string;
  type?: string;
  className?: string;
}> = ({ label, validator, placeholder, type = 'text', className }) => {
  const [value, setValue] = useState('');

  return (
    <div className={className}>
      <label className="block text-sm text-[#8b8fa8] mb-2">{label}</label>
      <FormFeedback validator={validator} onValueChange={setValue}>
        <input
          type={type}
          placeholder={placeholder}
          className="input-field w-full"
        />
      </FormFeedback>
    </div>
  );
};

export default FormFeedback;
