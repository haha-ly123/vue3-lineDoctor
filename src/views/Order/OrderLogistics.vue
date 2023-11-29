<script setup lang="ts">
import { getMedicalOrderLogistics } from '@/services/medicine'
import type { Logistics } from '@/types/medicine'
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router';
import { useRoute } from 'vue-router'
import AMapLoader from '@amap/amap-jsapi-loader'
// 引入自定义图标
import startIcon from '@/assets/start.png';
import endIcon from '@/assets/end.png';
import carIcon from '@/assets/car.png';

const router = useRouter()
// 获取物流信息
const logistics = ref<Logistics>()
const route = useRoute()
onMounted(async () => {

})

// 高德地图绘制物流信息
window._AMapSecurityConfig = {
    securityJsCode: '2d339205591a304a8af5605894042993'
}
onMounted(async () => {
    // 加载物流地址信息
    const res = await getMedicalOrderLogistics(route.params.id as string)
    logistics.value = res.data
    console.log('res.data', res.data)
    // 高德地图绘制物流信息
    AMapLoader.load({
        key: '748748b8299484adf892de04d850d33b',
        version: '2.0'
    }).then((AMap) => {
        // 使用 Amap 初始化地图
        console.log('AMap', AMap)
        const map = new AMap.Map('map', {
            // viewMode: '2D', // 默认使用 2D 模式，如果希望使用带有俯仰角的 3D 模式，请设置 viewMode: '3D'
            zoom: 11, // 初始化地图层级
            // center: [116.397428, 39.90923] // 初始化地图中心点
            mapStyle: "amap://styles/whitesmoke",//地图样式
        });
        // 绘制线路
        //构造路线导航类
        AMap.plugin("AMap.Driving", () => {
            var driving = new AMap.Driving({
                map: map,//绘制到哪
                showTraffic: false,//是否显示实时路况信息
                hideMarkers: true,//关闭默认图标
            });
            // 轨迹起点
            let start = logistics.value?.logisticsInfo.shift();
            // 轨迹终点
            let end = logistics.value?.logisticsInfo.pop();
            // 轨迹途经点
            let ways = logistics.value?.logisticsInfo.map(v => [v.longitude, v.latitude])

            // 自定义图标
            var startMarker = new AMap.Marker({
                position: [start?.longitude, start?.latitude],
                icon: startIcon,
                map: map
            })
            var endMarker = new AMap.Marker({
                position: [end?.longitude, end?.latitude],
                icon: endIcon,
                map: map
            })
            // 根据起终点经纬度规划驾车导航路线
            driving.search([start?.longitude, start?.latitude], [end?.longitude, end?.latitude],
                {//途经点
                    waypoints: ways
                },
                (status: string, result: object) => {
                    // 当前位置
                    let curMaeker = new AMap.Marker({
                        position: [logistics.value?.currentLocationInfo?.longitude, logistics.value?.currentLocationInfo?.latitude],
                        icon: carIcon,
                        map: map
                    })
                    // 3s后定位当中间进行缩放
                    setTimeout(() => {
                        map.setFitView([curMaeker, endMarker])
                    }, 3000)
                });
        })

    })
})

</script>

<template>
    <div class="order-logistics-page">
        <div id="map">
            <div class="title">
                <van-icon name="arrow-left" @click="router.back()" />
                <span>{{ logistics?.statusValue }}</span>
                <van-icon name="service" />
            </div>
            <div class="current">
                <p class="status">{{ logistics?.statusValue }} 预计{{ logistics?.estimatedTime }}送达</p>
                <p class="predict">
                    <span>{{ logistics?.name }}</span>
                    <span>{{ logistics?.awbNo }}</span>
                </p>
            </div>
        </div>
        <div class="logistics">
            <p class="title">物流详情</p>
            <van-steps direction="vertical" :active="0">
                <van-step v-for="item in logistics?.list" :key="item.id">
                    <p class="status">{{ item.statusValue }}</p>
                    <p class="content">{{ item.content }}</p>
                    <p class="time">{{ item.createTime }}</p>
                </van-step>
            </van-steps>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.order-logistics-page {
    --van-step-icon-size: 18px;
    --van-step-circle-size: 10px;
}

#map {
    height: 450px;
    background-color: var(--cp-bg);
    overflow: hidden;
    position: relative;

    .title {
        background-color: #fff;
        height: 46px;
        width: 355px;
        border-radius: 4px;
        display: flex;
        align-items: center;
        padding: 0 15px;
        font-size: 16px;
        position: absolute;
        left: 10px;
        top: 10px;
        box-sizing: border-box;
        box-shadow: 0px 0px 22px 0px rgba(229, 229, 229, 0.5);
        z-index: 999;

        >span {
            flex: 1;
            text-align: center;
        }

        .van-icon {
            font-size: 18px;
            color: #666;

            &:last-child {
                color: var(--cp-primary);
            }
        }
    }

    .current {
        height: 80px;
        border-radius: 4px;
        background-color: #fff;
        height: 80px;
        width: 355px;
        box-sizing: border-box;
        padding: 15px;
        position: absolute;
        left: 10px;
        bottom: 10px;
        box-shadow: 0px 0px 22px 0px rgba(229, 229, 229, 0.5);
        z-index: 999;

        .status {
            font-size: 15px;
            line-height: 26px;
        }

        .predict {
            color: var(--cp-tip);
            font-size: 13px;
            margin-top: 5px;

            >span {
                padding-right: 10px;
            }
        }
    }
}

.logistics {
    padding: 0 10px 20px;

    .title {
        font-size: 16px;
        padding: 15px 5px 5px;
    }

    .van-steps {
        :deep(.van-step) {
            &::after {
                display: none;
            }
        }

        .status {
            font-size: 15px;
            color: var(--cp-text3);
            margin-bottom: 4px;
        }

        .content {
            font-size: 13px;
            color: var(--cp-tip);
            margin-bottom: 4px;
        }

        .time {
            font-size: 13px;
            color: var(--cp-tag);
        }
    }
}

:deep(.amap-icon) {
    img {
        width: 20px;
    }
}
</style>
