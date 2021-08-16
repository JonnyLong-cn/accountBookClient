import React, { useState, useEffect, useRef } from 'react';
import moment from 'moment';
import BillItem from '@/components/BillItem';
import PopupType from '@/components/PopupType';
import PopupDate from '@/components/PopupDate';
import PopupAddBill from '@/components/PopupAddBill';
import CustomIcon from '@/components/CustomIcon';
import { Pull,Icon } from 'zarm';
import { REFRESH_STATE, LOAD_STATE } from '@/utils/type.js';
import axios from '@/utils/axios.js';

import s from './style.less';

function Home() {
  // 总收入和总支出
  const [totalExpense, setTotalExpense] = useState(0);
  const [totalIncome, setTotalIncome] = useState(0);
  // 账单列表
  const [list, setList] = useState([]);
  // 分页
  const [page, setPage] = useState(1);
  // 分页总数
  const [totalPage, setTotalPage] = useState(0);
  // 当前筛选类型
  const [currentSelect, setCurrentSelect] = useState({});
  // 当前筛选时间
  const [currentTime, setCurrentTime] = useState(moment().format('YYYY-MM'))
  // 下拉刷新状态
  const [refreshing, setRefreshing] = useState(REFRESH_STATE.normal);
  // 上拉加载状态
  const [loading, setLoading] = useState(LOAD_STATE.normal);

  /* 创建锚点 */
  // 账单类型 ref
  const typeRef = useRef();
  // 月份筛选 ref
  const monthRef = useRef();
  // 添加账单 ref
  const addRef = useRef();

  useEffect(() => {
    getBillList();
  }, [page, currentSelect, currentTime])

  // 获取账单
  async function getBillList() {
    const { data } = await axios.get(`/api/bill/list?page=${page}&page_size=5&date=${currentTime}`);
    // 下拉刷新，重制数据
    if (page === 1) {
      setList(data.list);
    } else {
      setList(list.concat(data.list));
    }
    // 设置收入和支出
    setTotalExpense(data.totalExpense.toFixed(2));
    setTotalIncome(data.totalIncome.toFixed(2));
    // 设置总页数
    setTotalPage(data.totalPage);
    // 上滑加载状态
    setLoading(LOAD_STATE.success);
    setRefreshing(REFRESH_STATE.success);
  }

  // 请求列表数据
  function refreshData() {
    setRefreshing(REFRESH_STATE.loading);
    if (page != 1) {
      setPage(1);
    } else {
      getBillList();
    };
  };

  // 加载数据
  function loadData() {
    if (page < totalPage) {
      setLoading(LOAD_STATE.loading);
      setPage(page + 1);
    }
  }

  function addToggle() {
    return addRef.current && addRef.current.show();
  }

  // 弹窗
  function toggle() {
    return typeRef.current && typeRef.current.show();
  }

  function monthToggle() {
    return monthRef.current && monthRef.current.show();
  }

  // 筛选类型
  function select(item) {
    setRefreshing(REFRESH_STATE.loading);
    // 触发刷新列表，将分页重制为 1
    setPage(1);
    setCurrentSelect(item);
  }

  function selectMonth(item) {
    setRefreshing(REFRESH_STATE.loading);
    setPage(1);
    setCurrentTime(item);
  }

  return (
    <div className={s.home}>
      <div className={s.header}>
        <div className={s.dataWrap}>
          <span className={s.expense}>总支出：<b>¥ {totalExpense}</b></span>
          <span className={s.income}>总收入：<b>¥ {totalIncome}</b></span>
        </div>
        <div className={s.typeWrap}>
          <div className={s.left} onClick={toggle}>
            <span className={s.title}>{currentSelect.name || '全部类型'} <Icon className={s.arrow} type="arrow-bottom" /></span>
          </div>
          <div className={s.right}>
            <span className={s.time} onClick={monthToggle}>{currentTime}<Icon className={s.arrow} type="arrow-bottom" /></span>
          </div></div>
      </div>
      <div className={s.contentWrap}>
        {
          list.length ?
            <Pull
              animationDuration={200}
              stayTime={400}
              refresh={{
                state: refreshing,
                handler: () => { refreshData() }
              }}
              load={{
                state: loading,
                distance: 200,
                handler: () => { loadData() }
              }}
            >
              {
                list.map((item, index) =>
                  <BillItem
                    bill={item}
                    key={index}
                  />
                )
              }
            </Pull> : null
        }
      </div>
      <div className={s.add} onClick={addToggle}><CustomIcon type='tianjia' /></div>
      {/* 类型弹窗 */}
      <PopupType ref={typeRef} onSelect={select} />
      {/* 日期弹窗 */}
      <PopupDate ref={monthRef} mode="month" onSelect={selectMonth} />
      {/* 增加账单弹窗 */}
      <PopupAddBill ref={addRef} onReload={refreshData} />
    </div>
  )
}

export default Home;